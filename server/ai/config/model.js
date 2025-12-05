import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { env } from "../../config/env.js";
import { ragTool } from "../tools/ragTool.js";

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: env.GEMINI_API_KEY,
}).bindTools([ragTool]);

export const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: env.GEMINI_API_KEY,
});
