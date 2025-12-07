import { fi } from "zod/v4/locales";
import { getSignedUrlForKey } from "../services/admin/service-helpers/s3.service.js";
import { getGraph } from "./graph/graph.js";
import { HumanMessage } from "@langchain/core/messages";

// Helper: Fix IDs and Sign URLs for Products
const sanitizeProducts = async (products) => {
  if (!Array.isArray(products)) return [];

  return Promise.all(
    products.map(async (p) => {
      // Handle MongoDB _id
      let id = p._id;
      if (typeof id === "object" && id !== null) id = id.toString();

      // Handle Signed URLs (Your existing logic)
      const imageUrl =
        p.imageIds && p.imageIds.length > 0
          ? await getSignedUrlForKey(p.imageIds[0])
          : null;

      // Clean up internal fields
      const { imageIds, ...rest } = p;

      return {
        ...rest,
        _id: id,
        price: p.price || { list: 0, sale: 0 },
        imageUrl,
      };
    })
  );
};

// Helper: Fix IDs for Orders (Simple pass-through for now)
const sanitizeOrders = async (orders) => {
  if (!Array.isArray(orders)) return [];

  return orders.map((o) => {
    // Ensure ID is string if it came from Mongo
    let id = o._id || o.id;
    if (typeof id === "object" && id !== null) id = id.toString();

    return {
      ...o,
      _id: id,
      // You could add date formatting here if needed
      // date: new Date(o.date).toLocaleDateString()
    };
  });
};

export const processWithLangGraph = async (userId, userMessage) => {
  const inputs = {
    messages: [new HumanMessage(userMessage)],
  };

  // 1. SECURITY & MEMORY CONTEXT
  // We pass 'userId' twice:
  // - thread_id: for LangGraph memory (conversation history)
  // - userId: explicitly for the Tools to access securely (e.g. Order Tool)
  const config = {
    configurable: {
      thread_id: userId,
      userId: userId,
    },
  };

  const graph = await getGraph();
  const result = await graph.invoke(inputs, config);

  // 2. EXTRACT RESPONSE
  const lastMessage = result.messages[result.messages.length - 1];
  const aiText = lastMessage.content;

  // 3. CHECK FOR CLIENT PAYLOAD (The Senior Pattern)
  // We established this in the Agent Node to attach data to 'response_metadata'
  const payload = lastMessage.response_metadata?.client_payload;

  let finalData = null;
  let responseType = "text";

  if (payload) {
    responseType = payload.responseType; // e.g., "product_list" or "order_list"
    let rawData = payload.products || payload.orders || [];

    if (rawData && !Array.isArray(rawData) && rawData.content) {
      rawData = rawData.content;
    }

    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (e) {
        rawData = [];
      }
    }

    // 4. SWITCH: POST-PROCESS DATA BASED ON TYPE
    // This keeps logic clean. Products need signed URLs; Orders might need date formatting.
    switch (responseType) {
      case "product_list":
        finalData = await sanitizeProducts(rawData);
        break;

      case "order_list":
        finalData = await sanitizeOrders(rawData);
        break;

      default:
        finalData = rawData;
    }
  }

  return {
    responseType: responseType,
    text: aiText,
    data: finalData,
  };
};
