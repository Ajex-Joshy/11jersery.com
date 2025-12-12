import React from "react";
import { useChat } from "./useChat.js";
import MessageInput from "./components/MessageInput.jsx";
import MessageList from "./components/MessageList.jsx";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../account/authSlice.js";

const ChatContainer = () => {
  const user = useSelector(selectCurrentUser);
  const { messages, sendMessage, isTyping, sendTyping } = useChat(user);

  return (
    <div className="flex flex-col rounded-2xl h-[600px] w-full max-w-md border border-gray-200  shadow-xl bg-gray-50 ">
      <div className="bg-linear-to-r from-indigo-600 to-indigo-500 px-5 py-4 text-white flex justify-between items-center shadow-md rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            11
          </div>
          <h2 className="font-semibold text-lg tracking-wide">
            11Jersey.com Support
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <MessageList
          messages={messages}
          currentUser={user.firstName}
          isTyping={isTyping}
        />
      </div>

      <div className="border-t border-gray-200">
        <MessageInput onSendMessage={sendMessage} onTyping={sendTyping} />
      </div>
    </div>
  );
};

export default ChatContainer;
