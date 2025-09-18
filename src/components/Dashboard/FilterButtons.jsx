import React from "react";

export default function FilterButtons({ filter, setFilter }) {
  return (
    <div className="flex justify-between space-x-2 mt-4">
      {["active", "pending", "rejected"].map(status => (
        <button
          key={status}
          onClick={() => setFilter(status)}
          className={`cursor-pointer flex-1 py-2 rounded-xl text-xs md:text-sm transition font-medium ${filter === status ? "bg-gray-300" : "bg-white"} hover:bg-gray-200`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
}
