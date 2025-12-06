import { useEffect, useState, useCallback } from "react";
import { socket } from "../../../socket/socket.js";
import { getSocketIdentity } from "../../../socket/socketIdentity.js";

export const useChat = (user) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!user) return;

    socket.auth = getSocketIdentity(user);
    socket.connect();
    setIsConnected(true);

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };
    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.disconnect();
      setIsConnected(false);
    };
  }, [user]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;

      const messageData = {
        userId: user._id,
        author: user.username,
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
      socket.emit(isTypingStatus ? "typing" : "stop_typing", user._id);
    },
    [user._id]
  );
  return { messages, sendMessage, isConnected, isTyping, sendTyping };
};
