import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../Utils/Sweetalert";
import { baseurl } from "../Utils/helper";
export default function Signup() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("password", form.password);
            if (image) {
                formData.append("image", image); // binary file
            }

            const response = await fetch(`${baseurl}/user/register`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                const token = data.token;
                const user = data.data?.name || form.name;

                localStorage.setItem("token", token);
                localStorage.setItem("user", user);

                showSuccess("Account created!", `Welcome, ${user}!`);
                navigate("/login");
            } else {
                showError(data.message || "Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            showError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
            <div className="flex w-full bg-white overflow-hidden shadow-2xl">
                {/* Left side image */}
                <div className="hidden md:block md:w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1493514789931-586cb221d7a7?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0"
                        alt="Signup visual"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
                </div>

                {/* Right side form */}
                <div className="flex w-full md:w-1/2 justify-center items-center p-8 bg-gray-50">
                    <div className="w-full max-w-md space-y-6">
                        <div className="flex flex-col items-center space-y-1">
                            <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-md">
                                ✏️
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-800">Create Account</h2>
                            <p className="text-gray-500">Sign up to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    required
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
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1">Profile Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none transition"
                                />
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="mt-2 w-20 h-20 rounded-full object-cover border"
                                    />
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="cursor-pointer w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold shadow-md disabled:opacity-50"
                            >
                                {loading ? "Signing up..." : "Sign Up"}
                            </button>
                        </form>

                        <p className="text-center text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="text-purple-600 hover:underline font-medium">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
