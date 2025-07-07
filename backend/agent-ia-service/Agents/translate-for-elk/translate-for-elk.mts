import "dotenv/config";

import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, END, START } from "@langchain/langgraph";
// import { ChatOpenAI } from "@langchain/openai";
import { searchElasticsearch } from "./tools/search_elasticsearch.mts";
import { translateQuestion } from "./tools/translate_question.mts";

// État de l'agent
interface AgentState {
  messages: Array<HumanMessage | AIMessage>;
  question: string;
  translatedKeywords?: string;
  searchResult?: any;
}

// const agentModel = new ChatOpenAI({
//   temperature: 0.5,
//   model: "gpt-3.5-turbo",
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Nœud pour traduire la question
async function translateNode(state: AgentState) {
  const lastMessage = state.messages[state.messages.length - 1];
  const question = lastMessage.content as string;

  const translationResult = await translateQuestion.invoke({
    userQuestion: question,
  });

  return {
    ...state,
    question,
    translatedKeywords: translationResult,
  };
}

// Nœud pour rechercher dans Elasticsearch
async function searchNode(state: AgentState) {
  const searchResult = await searchElasticsearch.invoke({
    question: state.translatedKeywords || state.question,
  });

  return {
    ...state,
    searchResult: searchResult.content,
  };
}

// Nœud pour formatter la réponse finale
async function responseNode(state: AgentState) {
  // Retourner directement la structure de données
  const response = new AIMessage({
    content: state.searchResult,
  });

  return {
    ...state,
    messages: [...state.messages, response],
  };
}

// Créer le graphe avec la nouvelle syntaxe
const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      value: (x: any, y: any) => x.concat(y),
      default: () => [],
    },
    question: {
      value: (x: any, y: any) => y ?? x,
      default: () => "",
    },
    translatedKeywords: {
      value: (x: any, y: any) => y ?? x,
      default: () => undefined,
    },
    searchResult: {
      value: (x: any, y: any) => y ?? x,
      default: () => undefined,
    },
  },
})
  .addNode("translate", translateNode)
  .addNode("search", searchNode)
  .addNode("response", responseNode)
  .addEdge(START, "translate")
  .addEdge("translate", "search")
  .addEdge("search", "response")
  .addEdge("response", END);

const agentCheckpointer = new MemorySaver();
export const translateForElkAgent = workflow.compile({
  checkpointer: agentCheckpointer,
});
