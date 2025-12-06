// src/features/user/chat/ChatWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import ChatContainer from "../ChatContainer.jsx";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);

  const toggleChat = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClick = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={widgetRef}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-3 animate-slide-up"
          style={{ width: "380px", maxWidth: "90vw" }}
        >
          <ChatContainer />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full shadow-xl bg-indigo-600 text-white flex items-center justify-center text-2xl hover:bg-indigo-700 transition-all"
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default ChatWidget;
