import "dotenv/config";

import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { loadAgentPrompt } from "./generate_prompt.mts";
import { weather } from "./tools/weather.mts";

const translateForElkPrompt = loadAgentPrompt("translate-for-elk");

// const agentModel = new ChatOpenAI({
//   temperature: 0.5,
//   model: "dolphin3.0-llama3.1-8b", // ou le nom de votre modèle
//   configuration: {
//     baseURL: "http://localhost:1234/v1",
//     apiKey: "not-needed", // LMStudio ne nécessite pas de clé API réelle
//   }
// });

const agentModel = new ChatOpenAI({
  temperature: 0.5,
  model: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY,
});

const agentCheckpointer = new MemorySaver();
export const translateForElkAgent = createReactAgent({
  prompt: translateForElkPrompt,
  llm: agentModel,
  tools: [weather],
  checkpointSaver: agentCheckpointer,
});
