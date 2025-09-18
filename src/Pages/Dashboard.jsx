import React, { useState, useEffect, useRef } from "react";
import { FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../Utils/Sweetalert";
import ProfileMenu from "../components/Dashboard/ProfileMenu";
import SearchBox from "../components/Dashboard/SearchBox";
import FilterButtons from "../components/Dashboard/FilterButtons";
import ChatRoomCard from "../components/Dashboard/ChatRoomCard";
import { baseurl } from "../Utils/helper";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [filter, setFilter] = useState("active");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const profileMenuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (currentUser) fetchChatRooms();
  }, [filter, currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseurl}/chatroomlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({}) // fetch all chat rooms, filter on frontend
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChatRooms(data.data || []);
      } else {
        showError("Error", data.message || "Failed to fetch chat rooms");
      }
    } catch (err) {
      console.error(err);
      showError("Error", "Something went wrong while fetching chat rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showError("Empty search", "Please enter a name to search.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseurl}/search/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: searchQuery }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResults(data.data || []);
        showSuccess("Data fetched successfully");
      } else if (res.status === 404) {
        showError(data.message || "User not found");
        setSearchResults([]);
      } else if (res.status === 401 || res.status === 403) {
        showError("Invalid token", "Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        showError("Search failed", data.message || "Could not fetch users");
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
      showError("Error", "Something went wrong while searching.");
      setSearchResults([]);
    }
  };

  const handleInvite = async ({ userId, userName }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseurl}/create/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${currentUser.name} & ${userName} Chat`,
          createdBy: currentUser._id,
          inviteUser: userId,
          type: "private"
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess("Invite sent", "Chat room created!");
        fetchChatRooms();
      } else {
        showError("Invite failed", data.message || "Could not create chat room");
      }
    } catch (err) {
      console.error(err);
      showError("Error", "Something went wrong while inviting");
    }
  };

  const handleAcceptReject = async (roomId, action) => {
    try {
      const res = await fetch(`${baseurl}/accept/reject/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          userId: currentUser._id,
          action,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess("Success", `Chat room ${action}ed!`);
        fetchChatRooms();
      } else {
        showError("Failed", data.message || `Could not ${action} chat room`);
      }
    } catch (err) {
      console.error(err);
      showError("Error", "Something went wrong while updating chat room");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showSuccess("Logged out", "You have been successfully logged out!");
    navigate("/login");
  };

  const openGroupPopup = async () => {
    setShowGroupPopup(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseurl}/findAlluser?page=1&limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const filtered = data.data.filter(u => u._id !== currentUser._id);
        setAllUsers(filtered);
      } else {
        showError("Error", data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
      showError("Error", "Something went wrong while fetching users");
    }
  };

  const handleGroupCreate = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      return showError("Missing data", "Enter group name & select users.");
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseurl}/create/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: groupName,
          createdBy: currentUser._id,
          inviteUser: selectedUsers,
          type: "group"
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess("Group Created", data.message || "Group chat created");
        setShowGroupPopup(false);
        setSelectedUsers([]);
        setGroupName("");
        fetchChatRooms();
      } else {
        showError("Group creation failed", data.message);
      }
    } catch (err) {
      console.error(err);
      showError("Error", "Failed to create group");
    }
  };

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-screen p-4 md:p-6 bg-white rounded-none md:rounded-xl shadow-inner relative">

      {/* Top section */}
      <div className="flex flex-col space-y-2">
        <ProfileMenu {...{ currentUser, setCurrentUser, showProfileInfo, setShowProfileInfo, profileMenuRef }} />

        <div className="flex justify-between items-center">
          <button
            onClick={openGroupPopup}
            className="flex items-center w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 text-sm font-semibold rounded-md shadow-md transition duration-200 cursor-pointer"
          >
            <span className="text-lg">＋</span> Create Group
          </button>
        </div>

        <SearchBox {...{ searchQuery, setSearchQuery, handleSearch, searchResults, handleInvite }} />
        <FilterButtons {...{ filter, setFilter }} />
      </div>

      {/* Chat Room List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-3 p-1 md:p-2">
        {loading ? (
          <div className="flex justify-center items-center">
            <FiLoader className="animate-spin text-3xl text-indigo-500" />
          </div>
        ) : chatRooms.length ? (
          chatRooms
            .filter(room => {
              const isGroup = room.type === "group";
              if (isGroup) {
                // For group chats, use userStatus
                return room.userStatus === filter;
              } else {
                // For private chats, use status
                return room.status === filter;
              }
            })
            .sort((a, b) => {
              const isGroupA = a.type === "group";
              const isGroupB = b.type === "group";
              if (isGroupA && isGroupB) {
                // Sort group chats by userStatus
                return (a.userStatus || '').localeCompare(b.userStatus || '');
              } else if (!isGroupA && !isGroupB) {
                // Sort private chats by status
                return (a.status || '').localeCompare(b.status || '');
              }
              // Keep group and private chats separate
              return isGroupA ? -1 : 1;
            })
            .map(room => {
              const isGroup = room.type === "group";
              const partnerId = isGroup ? null : room.users?.find(id => String(id) !== String(currentUser?._id));
              const partnerName = isGroup
                ? room.name
                : room?.name.replace(currentUser.name, '').replace('&', '').replace('Chat', '').trim();

              return (
                <ChatRoomCard
                  key={room._id}
                  {...{ room, currentUser, partnerId, partnerName, filter, handleAcceptReject, navigate }}
                />
              );
            })
        ) : (
          <p className="text-center text-gray-500 text-xs">No chat rooms found for this filter.</p>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="bg-red-500 cursor-pointer hover:bg-red-600 font-bold text-white py-2 rounded-xl text-xs md:text-sm mt-2"
      >
        Logout
      </button>

      {/* Group Create Popup */}
      {showGroupPopup && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 relative popup-animate">
            <h2 className="text-xl font-semibold text-gray-800">Create Group Chat</h2>

            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border border-gray-300 focus:border-indigo-500 outline-none px-4 py-2 rounded-lg text-sm"
            />

            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
              {allUsers.map(user => (
                <label key={user._id} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                    className="accent-indigo-500"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
              {allUsers.length === 0 && (
                <p className="text-sm text-center text-gray-400">No users available</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowGroupPopup(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGroupCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm rounded-lg shadow-md transition"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
