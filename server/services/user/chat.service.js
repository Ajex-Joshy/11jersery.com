import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import mongoose from "mongoose";
import logger from "../../config/logger.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const SYSTEM_PROMPT = `
You are the AI Support Agent for 11jersey.com.
Your goal is to help customers buy football jerseys and check their orders.
Be concise, friendly, and helpful.

Rules:
1. Only answer questions related to football jerseys, orders, shipping, or returns.
2. If you don't know the answer, ask the user to email support@11jersey.com.
3. Never invent product details or prices. Use the context provided.
4. If a user asks about an order, ask for their Order ID if you don't have it.
`;

/**
 * Main function to handle chat interaction
 */
export const getChatResponse = async (userMessage, userId = null) => {
  try {
    let contextData = "";

    if (
      userMessage.toLowerCase().includes("order") &&
      userId &&
      mongoose.isValidObjectId(userId)
    ) {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("orderId status totalAmount items.title");
      if (orders.length > 0) {
        contextData += `\nUser's Recent Orders:\n${JSON.stringify(
          orders,
          null,
          2
        )}\n`;
      } else {
        contextData += `\nUser has no recent orders.\n`;
      }
    }

    const productKeywords = userMessage.match(
      /(messi|ronaldo|madrid|barcelona|united|city|jersey)/i
    );
    if (productKeywords) {
      const products = await Product.find({
        $text: { $search: productKeywords[0] },
      })
        .limit(3)
        .select("title price.sale variants.size variants.stock");

      if (products.length > 0) {
        contextData += `\nRelevant Products found in catalog:\n${JSON.stringify(
          products,
          null,
          2
        )}\n`;
      }
    }

    const finalPrompt = `
      ${SYSTEM_PROMPT}
      
      CONTEXT DATA (Use this to answer):
      ${contextData}

      User Query: "${userMessage}"
    `;

    // 3. Call Gemini
    const result = await model.generateContent(finalPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    logger.error("Gemini Chat Error:", error);
    return "I'm having a little trouble connecting to the dugout. Please try again in a moment!";
  }
};
