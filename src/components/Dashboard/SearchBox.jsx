import React from "react";
import { FiSearch } from "react-icons/fi";

export default function SearchBox({
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchResults,
  handleInvite,
  involvedUserIds = [] // <-- default empty array
}) {
  // Filter searchResults based on existing involvement
  const filteredResults = searchResults.filter(
    user => !involvedUserIds.includes(user._id)
  );

  return (
    <div className="bg-gray-50 rounded-xl shadow-inner mb-4 border p-2">
      <div className="flex items-center border-b pb-2">
        <input
          type="text"
          placeholder="Search users..."
          className="flex-1 px-3 py-2 text-sm bg-white focus:bg-gray-200 rounded-l-xl focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-[10px] rounded-r-xl cursor-pointer"
        >
          <FiSearch />
        </button>
      </div>

      <div className="max-h-[200px] overflow-y-auto">
        {filteredResults.length ? (
          filteredResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between px-3 py-2 border-b hover:bg-gray-100"
            >
              <span className="text-gray-700 text-sm">{user.name}</span>
              <button
                onClick={() => handleInvite({ userId: user._id, userName: user.name })}
                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer"
              >
                Invite
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm px-3 py-2">
            {searchResults.length === 0
              ? "No users found. Please search."
              : "User already invited or in chat."}
          </p>
        )}
      </div>
    </div>
  );
}
