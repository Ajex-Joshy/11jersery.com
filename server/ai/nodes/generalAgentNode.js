import { AIMessage, SystemMessage } from "@langchain/core/messages";
import logger from "../../config/logger.js";
import { llm } from "../config/model.js";

const GENERAL_SYSTEM_PROMPT = `
You are the "Concierge AI" for 11jersey.com, a premium football jersey e-commerce store. 

YOUR GOAL:
Provide a warm welcome, handle small talk, and gently guide the user toward:
1. Browsing products.
2. Checking their order status.
3. Customer support.

RULES & BOUNDARIES:
- **Tone**: Friendly, professional, and concise. Do not be overly chatty.
- **Scope Restriction**: If the user asks about topics unrelated to the store (e.g., "Write a poem", "Explain quantum physics", "Write code"), politely refuse. Say: "I specialize in helping you find the best gear at [YOUR_STORE_NAME]. I can't help with that specific request, but I can show you our latest arrivals!"
- **No Hallucinations**: Do not invent products. If they ask for a product, tell them you can check the inventory if they specify what they are looking for.

RESPONSE FORMAT:
Keep responses short (under 3 sentences) to keep the conversation moving.
`;

export const generalAgentNode = async (state) => {
  const { messages } = state;

  logger.info("General Agent node activated.");

  try {
    const prompt = [new SystemMessage(GENERAL_SYSTEM_PROMPT), ...messages];

    const response = await llm.invoke(prompt, { maxRetries: 1 });
    return {
      messages: [response],
    };
  } catch (error) {
    logger.error(`General Agent failed: ${error.message}`);

    return {
      messages: [
        new AIMessage(
          "I'm having a little trouble connecting right now. Could you ask me about our products again?"
        ),
      ],
    };
  }
};
