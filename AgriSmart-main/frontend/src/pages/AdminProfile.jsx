import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setUser } from "../main";
import { userApi } from "../services/api";

import {
  FaUserCircle,
  FaEnvelope,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
  FaPhone
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminProfile() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.agri.token);
  const admin = useSelector((state) => state.agri.user) || {
    name: "Siddharth Sharma",
    email: "admin@agrismart.com",
    phone: "9999988888",
    role: "ADMIN"
  };

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: admin.name || "Admin",
    email: admin.email || "admin@agrismart.com",
    phone: admin.phone || "9999988888",
    role: admin.role || "ADMIN",
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        role: admin.role || "ADMIN",
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      if (token) {
        const updated = await userApi.updateProfile(token, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });
        dispatch(setUser(updated));
      } else {
        dispatch(setUser({ ...admin, ...formData }));
      }
      toast.success("Admin profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: admin.role || "ADMIN",
    });

    setIsEditing(false);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminNavbar />

        <div className="admin-content">
          {/* PAGE HEADING */}
          <div className="page-heading">
            <span className="page-tag">ACCOUNT SETTINGS</span>
            <h1>Admin Profile</h1>
            <p>Manage your administrator account information and profile details.</p>
          </div>

          {/* PROFILE CARD */}
          <div className="admin-profile-page">
            <div className="profile-card">
              {/* PROFILE HEADER */}
              <div className="profile-card-header">
                <div className="profile-large-avatar">
                  <FaUserCircle />
                </div>

                <div className="profile-header-info">
                  <h2>{admin.name}</h2>
                  <p>
                    <FaUserShield />
                    {admin.role}
                  </p>
                </div>

                {!isEditing && (
                  <button
                    className="edit-profile-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* PROFILE DETAILS */}
              <div className="profile-details">
                <div className="profile-field">
                  <label>
                    <FaUserCircle />
                    Full Name
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{admin.name}</p>
                  )}
                </div>

                <div className="profile-field">
                  <label>
                    <FaEnvelope />
                    Email Address
                  </label>

                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{admin.email}</p>
                  )}
                </div>

                <div className="profile-field">
                  <label>
                    <FaPhone />
                    Phone Number
                  </label>

                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{admin.phone || "Not specified"}</p>
                  )}
                </div>

                <div className="profile-field">
                  <label>
                    <FaUserShield />
                    Role
                  </label>

                  <p>{admin.role}</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {isEditing && (
                <div className="profile-actions">
                  <button
                    className="save-profile-btn"
                    onClick={handleSave}
                  >
                    <FaSave />
                    Save Changes
                  </button>

                  <button
                    className="cancel-profile-btn"
                    onClick={handleCancel}
                  >
                    <FaTimes />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminProfile;
