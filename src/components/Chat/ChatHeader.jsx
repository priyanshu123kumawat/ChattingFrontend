import React, { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { MdVideoCall, MdCall } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi"; // ✅ Added icon
import { useNavigate } from "react-router-dom";

export default function ChatHeader({
  partnerName,
  isOnline,
  onVideoCall,
  onVoiceCall,
  isGroupChat = false,
  participants = [], // ✅ Passed from ChatPage
}) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const groupCreatorId = participants[0]?._id; // assuming first user is creator

  return (
    <header className="relative flex items-center justify-between px-4 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md rounded-b-lg">
      <button
        onClick={() => navigate("/dashboard")}
        className="md:hidden text-2xl hover:text-gray-200 text-white-500"
      >
        <FiArrowLeft />
      </button>

      <div className="flex-1 text-center md:text-left truncate">
        <div className="flex items-center justify-center md:justify-start space-x-2">
          <span className="text-base font-semibold truncate">{partnerName}</span>

         
          {isGroupChat && (
            <button onClick={toggleMenu} className="text-xl hover:text-gray-200">
              <HiDotsVertical />
            </button>
          )}
        </div>

        {!isGroupChat && (
          <div className="flex items-center justify-center md:justify-start space-x-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-300"}`}
            />
            <span className="text-white">{isOnline ? "Online" : "Offline"}</span>
          </div>
        )}
      </div>

      {!isGroupChat && (
        <div className="flex items-center space-x-3 ml-2">
          {/* Voice Call */}
          <button
            onClick={onVoiceCall}
            className="p-2 rounded-full border border-green-900 bg-green-500 hover:bg-green-600 transition-all duration-200 shadow-md cursor-pointer"
            title="Voice Call"
          >
            <MdCall className="w-5 h-5 text-white" />
          </button>

          {/* Video Call */}
          <button
            onClick={onVideoCall}
            className="p-2 rounded-full border border-blue-900 bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-md cursor-pointer"
            title="Video Call"
          >
            <MdVideoCall className="w-5 h-5 text-white" />
          </button>
        </div>

      )}

      {/* ✅ Dropdown showing group members */}
      {isGroupChat && showMenu && (
        <div className="absolute right-4 top-full mt-2 w-64 bg-white text-black rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b font-semibold bg-indigo-100">Group Members</div>
          <ul className="max-h-64 overflow-y-auto">
            {participants.map((user) => (
              <li
                key={user._id}
                className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <span className="truncate">{user.name}</span>
                {user._id === groupCreatorId && (
                  <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
