import React, { useState, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input) onTyping(false);
    }, 1000);

    if (input) onTyping(true);

    return () => clearTimeout(timeout);
  }, [input, onTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
      onTyping(false);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className={`
          flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-3xl transition-all duration-200
          ${
            isFocused
              ? "border-indigo-400 ring-4 ring-indigo-50 shadow-sm"
              : "border-gray-200"
          }
        `}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim()}
          className={`
            p-2 rounded-full flex items-center justify-center transition-all duration-200
            ${
              input.trim()
                ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transform hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          <Send size={18} className={input.trim() ? "ml-0.5" : ""} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
