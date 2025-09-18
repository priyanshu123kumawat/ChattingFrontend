import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

export default function DashboardLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/dashboard/chat");

  return (
    <div className="flex scroll-none bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Sidebar: visible always on md+; hidden on small when chat is open */}
      <div className={`bg-white shadow-2xl ${isChatPage ? "hidden md:block" : "block"} w-full md:w-72`}>
        <Dashboard />
      </div>

      {/* Chat or other pages */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
