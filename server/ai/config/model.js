import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { env } from "../../config/env.js";

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: env.GEMINI_API_KEY,
});

export const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: env.GEMINI_API_KEY,
});
