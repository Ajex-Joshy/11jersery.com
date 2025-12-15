import { useEffect, useState, useCallback } from "react";
import { socket } from "../../../socket/socket.js";
import { getSocketIdentity } from "../../../socket/socketIdentity.js";

export const useChat = (user) => {
  const [messages, setMessages] = useState([
    {
      author: "AI_Agent",
      message:
        "Welcome to 11Jersey.com! How can I help you today? Browse products, track an order, or ask for support.",
      type: "text",
      time: Date.now(),
    },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.auth = getSocketIdentity(user);
    socket.connect();
    setIsConnected(true);

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);

      // Stop typing when a response is received
      setIsTyping(false);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.disconnect();
      setIsConnected(false);
    };
  }, [user]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;

      // Set typing to true automatically when user sends a message
      setIsTyping(true);

      const messageData = {
        userId: user?._id,
        author: user?.username,
        message: text,
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, messageData]);

      socket.emit("send_message", messageData);
    },
    [user]
  );

  const sendTyping = useCallback(
    (isTypingStatus) => {
      socket.emit(isTypingStatus ? "typing" : "stop_typing", user?._id);
    },
    [user?._id]
  );

  return { messages, sendMessage, isConnected, isTyping, sendTyping };
};
