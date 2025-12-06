import asyncHandler from "express-async-handler";
import { AppError } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { getGraph } from "../../ai/graph/graph.js";
import { HumanMessage } from "@langchain/core/messages";

export const chatController = asyncHandler(async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!sessionId)
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "SESSIONID_NOT_FOUND",
        "session Id is required"
      );

    const graph = getGraph();

    const config = {
      configurable: { thread_id: sessionId },
      recursionLimit: 50,
    };
    const response = await graph.invoke(
      { messages: [new HumanMessage(message)] },
      config
    );

    const lastMessage = response.messages[response.messages.length - 1];

    res.json({
      response: lastMessage.content,
    });
  } catch (error) {
    logger.error("Chat Error:", error);
    throw error;
  }
});
