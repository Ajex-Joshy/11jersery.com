import logger from "../config/logger.js";
import { getSignedUrlForKey } from "../services/admin/service-helpers/s3.service.js";
import { getGraph } from "./graph/graph.js";
import { HumanMessage } from "@langchain/core/messages";

const sanitizeProducts = async (products) => {
  if (!Array.isArray(products)) return [];

  return Promise.all(
    products.map(async (p) => {
      let id = p._id;
      if (typeof id === "object" && id !== null) id = id.toString();

      const imageUrl =
        p.imageIds && p.imageIds.length > 0
          ? await getSignedUrlForKey(p.imageIds[0])
          : null;

      // eslint-disable-next-line no-unused-vars
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

const sanitizeOrders = async (orders) => {
  if (!Array.isArray(orders)) return [];

  return orders.map((o) => {
    let id = o._id || o.id;
    if (typeof id === "object" && id !== null) id = id.toString();

    return {
      ...o,
      _id: id,
    };
  });
};

export const processWithLangGraph = async (userId, userMessage) => {
  const inputs = {
    messages: [new HumanMessage(userMessage)],
  };

  const config = {
    configurable: {
      thread_id: userId,
      userId: userId,
    },
  };

  const graph = await getGraph();
  const result = await graph.invoke(inputs, config);

  const lastMessage = result.messages[result.messages.length - 1];
  const aiText = lastMessage.content;

  const payload = lastMessage.response_metadata?.client_payload;

  let finalData = null;
  let responseType = "text";

  if (payload) {
    responseType = payload.responseType;
    let rawData = payload.products || payload.orders || [];

    if (rawData && !Array.isArray(rawData) && rawData.content) {
      rawData = rawData.content;
    }

    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (err) {
        logger.error(err);
        rawData = [];
      }
    }

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
