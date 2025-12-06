import { getSignedUrlForKey } from "../services/admin/service-helpers/s3.service.js";
import { getGraph } from "./graph/graph.js";
import { HumanMessage } from "@langchain/core/messages";

export const processWithLangGraph = async (userId, userMessage) => {
  console.log("userId from processgraph", userId);
  const inputs = {
    messages: [new HumanMessage(userMessage)],
  };

  const config = { configurable: { thread_id: userId } };
  console.log("id", config.configurable.thread_id);
  const graph = await getGraph();

  const result = await graph.invoke(inputs, config);

  // Extract the last AI message
  const lastMessage = result.messages[result.messages.length - 1];

  const toolMessage = result.messages
    .slice()
    .reverse()
    .find((msg) => msg.name === "product_search"); // removed instanceof check to be safer

  let products = null;
  let responseType = "text";

  if (toolMessage) {
    responseType = "product_list";

    // --- EXTRACTION LOGIC ---
    let rawData = toolMessage.content;

    // A. Parse the string content
    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (e) {
        console.error("Parsing failed", e);
        rawData = [];
      }
    }

    // B. HANDLE THE NESTING (Fix for your specific log issue)
    // Your log shows the content is a serialized object with "kwargs.content"
    if (rawData && rawData.kwargs && Array.isArray(rawData.kwargs.content)) {
      rawData = rawData.kwargs.content;
    }
    // Or sometimes it might be in rawData.content directly (if structure changes)
    else if (rawData && Array.isArray(rawData.content)) {
      rawData = rawData.content;
    }

    // C. SANITIZE DATA (Convert Buffer IDs to Strings)
    if (Array.isArray(rawData)) {
      products = await Promise.all(
        rawData.map(async (p) => {
          // Handle MongoDB _id if it's an object/buffer
          let id = p._id;
          if (typeof id === "object" && id !== null) {
            id = id.toString();
          }

          const imageUrl =
            p.imageIds && p.imageIds.length > 0
              ? await getSignedUrlForKey(p.imageIds[0])
              : null;

          delete p.imageIds;

          return {
            ...p,
            _id: id,
            price: p.price || { list: 0, sale: 0 },
            imageUrl,
          };
        })
      );
    }
  }
  console.log("products", products);

  return {
    responseType: responseType,
    text: lastMessage.content,
    data: products,
  };
};
