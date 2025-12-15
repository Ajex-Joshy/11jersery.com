import { processWithLangGraph } from "../ai/langgraph-process.js";
import logger from "../config/logger.js";

export const initializeSocket = (io) => {
  io.use((socket, next) => {
    const { userId, role } = socket.handshake.auth;

    if (!userId) return next(new Error("Invalid Identity"));

    // Attach user info to the socket session
    socket.user = { userId, role };
    next();
  });
  io.on("connection", (socket) => {
    const personalRoom = `room_${socket.user.userId}`;
    socket.join(personalRoom);
    logger.info(`joined room ${personalRoom}`);

    socket.on("send_message", async (data) => {
      const { message } = data;
      try {
        socket.to(personalRoom).emit("typing", { author: "AI_Agent" });

        const response = await processWithLangGraph(
          socket.user.userId,
          message
        );

        const aiMessageData = {
          room: personalRoom,
          author: "AI_Agent",
          message: response.text,
          type: response.responseType,
          data: response.data,
          time: new Date().toISOString(),
        };
        io.to(personalRoom).emit("receive_message", aiMessageData);
        //  saveToDb(socket.user.userId, message, 'Human');
        //  saveToDb(socket.user.userId, aiResponseText, 'AI');
      } catch (err) {
        logger.error("LangGraph Error:", err);
        socket.emit("error", {
          message: "The AI agent is currently unavailable.",
        });
      } finally {
        io.to(personalRoom).emit("stop_typing");
      }
    });

    // 4. Disconnect
    socket.on("disconnect", () => {
      logger.info("User Disconnected", socket.id);
    });
  });
};
