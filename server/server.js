import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { OpenAIApi, Configuration } from "openai";

// load env vars
dotenv.config({ path: "../.env" });

// Create open-ai config
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a new instance of open-ai with the config
const openai = new OpenAIApi(configuration);

// express
const app = express();
// middlewares
app.use(cors()); //this allow front end to call the server
app.use(express.json()); // this allow us to pass json from frontend to backend

// request
app.get("/", async (req, res) => res.status(200).send({ message: "Hello" }));

// post request
app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    console.log(prompt);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.1, // high temp means model take more risk
      max_tokens: 3000, // output sequence length -- Long responses
      top_p: 1,
      frequency_penalty: 0.5, // how often to repeat same sentence / how likely to repeat same ans for similar ques
      presence_penalty: 0,
      //   stop: ['"""'], // stop words
    });

    res.status(200).send({ botResponse: response.data.choices[0].text });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

const port = process.env.BACKEND_PORT;
app.listen(port, () => console.log("Server started listening on", port));
