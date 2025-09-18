import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../Utils/Sweetalert";
import { baseurl } from "../Utils/helper";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Login request WITHOUT token (since login itself provides the token)
      const response = await fetch(`${baseurl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Token bhi check karo empty nahi hai
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        showSuccess(`${data.message} ${data.data?.name || "User"}!`);
        navigate("/dashboard");
      } else {
        showError(data.message || "Invalid email or password");
      }

    } catch (error) {
      console.error("Login error:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="flex w-full bg-white overflow-hidden shadow-2xl">
        {/* Left side with image */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0"
            alt="Login visual"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
        </div>

        {/* Right side with form */}
        <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-gray-50">
          <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col items-center space-y-1">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-md">
                🔒
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500">Login to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-semibold shadow-md disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
