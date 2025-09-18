import React, { useState, useRef, useEffect } from "react";
import { FiSettings, FiX } from "react-icons/fi";
import { MdEditNote } from "react-icons/md";
import axios from "axios";
import { baseurl } from "../../Utils/helper";

export default function ProfileMenu({
  currentUser,
  setCurrentUser,
  showProfileInfo,
  setShowProfileInfo,
  profileMenuRef
}) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [editedData, setEditedData] = useState({
    name: currentUser?.name || "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(currentUser?.image || "https://i.pravatar.cc/40");

  useEffect(() => {
    if (!editedData.image) {
      setPreviewImage(currentUser?.image || "https://i.pravatar.cc/40");
    }
  }, [editedData.image, currentUser]);

  const handleEditClick = () => {
    setEditedData({
      name: currentUser?.name || "",
      image: null,
    });
    setShowEditForm(true);
  };

  const handleInputChange = (e) => {
    setEditedData((prev) => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData((prev) => ({
        ...prev,
        image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editedData.name);
      formData.append("_id", currentUser._id); // ✅ Pass _id
      if (editedData.image) {
        formData.append("image", editedData.image);
      }

      const response = await axios.post(
        `${baseurl}/profile/update`,
        formData
      );

      console.log("Profile updated:", response.data);

      if (response.data?.success && response.data?.data) {
        const updatedUser = response.data.data;

        // ✅ Save real updated user from backend
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }

      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div
      ref={profileMenuRef}
      className="relative flex items-center space-x-4 mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl text-white"
    >
      <img
        src={currentUser?.image || "https://i.pravatar.cc/40"}
        alt="avatar"
        className="w-10 h-10 rounded-full border-2 border-white object-cover cursor-pointer"
      />
      <div className="flex-1">
        <h2 className="font-semibold truncate">{currentUser?.name || "Guest"}</h2>
        <p className="text-xs opacity-80">Online</p>
      </div>

      <button
        onClick={handleEditClick}
        className="relative text-2xl hover:opacity-90 cursor-pointer"
        title="Edit Profile"
      >
        <MdEditNote />
      </button>

      <button
        onClick={() => setShowProfileInfo(prev => !prev)}
        className="relative text-xl hover:opacity-80 cursor-pointer"
        title="Profile Settings"
      >
        <FiSettings />
      </button>

      <div className={`absolute top-full right-0 mt-2 w-60 bg-white text-gray-800 shadow-lg p-3 z-20 rounded-md
          transform transition-transform duration-300 ease-out origin-top
          ${showProfileInfo ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}>
        <h3 className="font-semibold text-base mb-1">Name : {currentUser?.name || "Unknown User"}</h3>
        <p className="text-xs text-gray-600 mb-2">Email : {currentUser?.email || "No email"}</p>
        <p className="text-xs text-gray-600 mb-2">ID : {currentUser?._id || "N/A"}</p>
        <p className="text-xs text-gray-600 mb-2">Role : {currentUser?.role || "N/A"}</p>
        <div className="border-t mt-2 pt-2 flex justify-end space-x-2">
          <button onClick={() => setShowProfileInfo(false)} className="text-gray-600 hover:text-gray-800">
            <FiX className="w-4 h-4 cursor-pointer" />
          </button>
        </div>
      </div>

      {showEditForm && (
        <div className="absolute top-full mt-2 w-72 bg-white text-gray-800 shadow-lg z-30 rounded-xl p-4 space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-purple-700">Edit Profile</h3>
            <button
              onClick={() => setShowEditForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Profile Image and File Upload */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={previewImage}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover shadow"
            />
            <label className="cursor-pointer text-xs text-purple-600 hover:underline">
              Change Photo
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs text-gray-600 font-medium">Name</label>
            <input
              type="text"
              value={editedData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Your name"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowEditForm(false)}
              className="text-xs px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
