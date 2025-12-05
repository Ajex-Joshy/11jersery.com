import { createRetrieverTool } from "@langchain/classic/tools/retriever";
import { retriever } from "../config/retriever.js";
import z from "zod";

export const ragTool = createRetrieverTool(retriever, {
  name: "rag_knowledge_base",
  description:
    "Retrieves relevant knowledge from stored ecommerce docs which includes policies, frequently asked questions and available products",
  schema: z.object({
    query: z.string().describe("user question to search in knowledge base"),
  }),
});
