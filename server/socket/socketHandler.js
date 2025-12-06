import { processWithLangGraph } from "../ai/processWithLangGraph.js";

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
    console.log(`joined room ${personalRoom}`);

    socket.on("send_message", async (data) => {
      const { message } = data;
      console.log("socket.user", socket.user);
      try {
        socket.to(personalRoom).emit("typing", { author: "AI_Agent" });
        console.log("uid", socket.user.userId);

        const response = await processWithLangGraph(
          socket.user.userId,
          message
        );

        const aiMessageData = {
          room: personalRoom,
          author: "AI_Agent",
          message: response.text,
          type: response.responseType,
          products: response.data,
          time: new Date().toISOString(),
        };
        console.log("msg", aiMessageData);
        io.to(personalRoom).emit("stop_typing");
        io.to(personalRoom).emit("receive_message", aiMessageData);
        // await saveToDb(socket.user.userId, message, 'Human');
        // await saveToDb(socket.user.userId, aiResponseText, 'AI');
      } catch (err) {
        console.error("LangGraph Error:", err);
        socket.emit("error", {
          message: "The AI agent is currently unavailable.",
        });
        socket.emit("stop_typing");
      }
    });

    // 3. Typing Indicators
    socket.on("typing", (roomId) => {
      socket.to(roomId).emit("typing");
    });

    socket.on("stop_typing", (roomId) => {
      socket.to(roomId).emit("stop_typing");
    });

    // 4. Disconnect
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });
};
