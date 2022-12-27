import axios from "axios";

import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat-container");

let loadInterval;
let chatHeight = 0;

const loader = (el) => {
  el.textContent = "";

  // every 300ms add a '.' to textContent and reset on 4 dots
  loadInterval = setInterval(() => {
    el.textContent += ".";
    if (el.textContent === "....") {
      el.textContent = "";
    }
  }, 300);
};

// this is for interactiveness
// every 20ms type a char
const typeText = (el, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML +=
        text.charAt(index) === "\n" ? "<br />" : text.charAt(index);
      // if newline scroll down
      chatContainer.scrollTop = chatContainer.scrollHeight;
      index++;
    } else {
      clearInterval(interval);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, 20);
};

// we have to generate a unique id for every msg in-order to map over them
const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  // 16 digit string
  const hexString = randomNumber.toString(16);
  return `id-${timestamp}-${hexString}`;
};

// chat message stripe
const chatStrip = (isAI, msg, uniqueID) => `
<div class="chat-box ${isAI ? "bot" : "user"}">
<div class="chat-icon">
  <img class="chat-icon-img" src="./assets/${isAI ? "bot" : "user"}.svg" />
</div>
<div class="chat-content" id='chat-content' ><p id=${uniqueID}>${msg}</p></div>
</div>
`;

// default behaviour when we submit a form is to reload
// we dont want that hence event.preventDefault

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const userMessage = data.get("prompt");

  // user chat strip
  chatContainer.innerHTML += chatStrip(false, userMessage);

  // reset the form
  form.reset();

  // bot chat
  const uniqueID = generateUniqueId();
  chatContainer.innerHTML += chatStrip(true, "", uniqueID);

  // get the paragraph element
  const botMessageElem = document.getElementById(uniqueID);

  // pass the paragraph elem to loader
  loader(botMessageElem);

  // add scroll functionality
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Get response from backend
  const response = await axios.post("https://codex-openai-cowk.onrender.com", {
    prompt: userMessage,
  });
  console.log(response);

  // clear the interval
  clearInterval(loadInterval);

  // Print the bot response
  botMessageElem.innerHTML = response.status === 200 ? "" : "Server Error";
  // Pretty print -- interactive
  if (response.status === 200) {
    typeText(botMessageElem, response.data.botResponse.trim());
  }
};

// EVENT LISTENERS
form.addEventListener("submit", handleSubmit);
// most users press enter-key so lets add the event-listener for that
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
