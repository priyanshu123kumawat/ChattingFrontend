import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/SignUp';
import DashboardLayout from './Pages/DashboardLayout';
import ChatPage from './Pages/ChatPage';
import ProtectedRoute from './Utils/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="chat/:roomId" element={<ChatPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
