import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateAdminProfile } from "../services/adminSlice";

import {
  FaUserCircle,
  FaEnvelope,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminProfile() {
  const dispatch = useDispatch();

  const admin = useSelector(
    (state) => state.admin.admin
  );

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    dispatch(updateAdminProfile(formData));

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
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

            <span className="page-tag">
              ACCOUNT SETTINGS
            </span>

            <h1>Admin Profile</h1>

            <p>
              Manage your administrator account
              information and profile details.
            </p>

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
