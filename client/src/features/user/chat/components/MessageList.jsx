import React, { useEffect, useRef } from "react";
import ChatProductCard from "./ChatProductCard";

const MessageList = ({ messages, currentUser, isTyping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 ">
      {messages.map((msg, index) => {
        const isMe = msg.author === currentUser;
        const isSequence =
          index > 0 && messages[index - 1].author === msg.author;

        return (
          <div
            key={index}
            className={`group flex items-end gap-2 w-full ${
              isMe ? "justify-end" : "justify-start"
            } ${isSequence ? "mt-0.5" : "mt-4"}`}
          >
            {/* 1. Avatar (Left Side) */}
            {!isMe && (
              <div className="w-7 h-7 flex-shrink-0 mb-1">
                {!isSequence && (
                  <div className="w-7 h-7 bg-gray-300 rounded-full overflow-hidden border border-gray-100">
                    <img
                      src={`https://ui-avatars.com/api/?name=${
                        msg.author ?? "you"
                      }&background=random&color=fff`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2. CONTENT WRAPPER (This fixes the layout) */}
            {/* We stack the text and the carousel vertically inside this wrapper */}
            <div
              className={`flex flex-col max-w-[80%] ${
                isMe ? "items-end" : "items-start"
              }`}
            >
              {/* Text Bubble */}
              {msg.message && (
                <div
                  className={`p-3 rounded-lg w-fit ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
              )}

              {/* Product Carousel */}
              {msg.type === "product_list" && msg.data && (
                <div className="mt-2 w-full max-w-full">
                  {/* Passing products to your existing component */}
                  <ChatProductCard products={msg.data} />
                </div>
              )}
            </div>

            {/* 3. Timestamp (Visible on Hover) */}
            <div
              className={`text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2 flex-shrink-0 ${
                isMe ? "order-first mr-1" : "ml-1"
              }`}
            >
              {new Date(msg.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-end gap-2 mt-2">
          <div className="w-7 h-7 bg-gray-300 rounded-full overflow-hidden border border-gray-100 mb-1">
            <div className="w-full h-full bg-gray-400" />
          </div>
          <div className="bg-[#efefef] px-4 py-3 rounded-3xl rounded-tl-lg flex items-center space-x-1 w-16 h-10">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
