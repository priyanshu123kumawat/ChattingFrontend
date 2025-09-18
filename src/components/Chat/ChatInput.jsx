import React from "react";
import { FiSend } from "react-icons/fi";

export default function ChatInput({ newMsg, setNewMsg, handleSend, isGroupChat = false }) {
  return (
    <footer className="p-3 flex border-t bg-white">
      <input
        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder={isGroupChat ? "Message the group..." : "Type a message..."}
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-3 rounded-full shadow-md transition cursor-pointer"
      >
        <FiSend />
      </button>
    </footer>
  );
}
