import asyncHandler from "express-async-handler";
import { getChatResponse } from "../../services/user/chat.service.js";

export const chatController = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  const response = await getChatResponse(message, history);
  res.status(200).json({ response });
});
