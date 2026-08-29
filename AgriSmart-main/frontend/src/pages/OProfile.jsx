import React, { useState } from "react";
import "../styles/oprofile.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaHome, FaUsers, FaClipboardList,
  FaBell, FaSearch, FaUserCircle, FaMapMarkerAlt,
  FaEnvelope, FaPhone, FaEdit, FaSignOutAlt, FaShieldAlt, FaKey, FaSave, FaTimes
} from "react-icons/fa";
import { setUser, setToken } from "../main";
import { userApi } from "../services/api";

const MENU = [
  { name: "Dashboard", icon: <FaHome />, path: "/officer/dashboard", key: "dashboard" },
  { name: "Farmers", icon: <FaUsers />, path: "/officer/farmers", key: "farmers" },
  { name: "Schemes", icon: <FaClipboardList />, path: "/officer/oschemes", key: "schemes" },
  { name: "Broadcast", icon: <FaBell />, path: "/officer/onification", key: "notif" },
  { name: "Profile", icon: <FaUserCircle />, path: "/officer/oprofile", key: "profile" },
];

export default function OProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(s => s.agri.user);
  const token = useSelector(s => s.agri.token);

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  // Password change
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const handleLogout = () => {
    dispatch(setUser(null));
    dispatch(setToken(null));
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  /* ── Save profile (Admin controls District/State assignment) ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    try {
      const updated = await userApi.updateProfile(token, {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      dispatch(setUser({ ...user, ...updated }));
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile: " + err.message);
    }
    setSaving(false);
  };

  /* ── Change password ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPw || newPw !== confirmPw) { toast.error("Passwords do not match."); return; }
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setChangingPw(true);
    try {
      await userApi.updateProfile(token, { password: newPw });
      setNewPw(""); setConfirmPw("");
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error("Failed to change password: " + err.message);
    }
    setChangingPw(false);
  };

  const infoItems = [
    { label: "Full Name", value: user?.name, icon: <FaUserCircle /> },
    { label: "Email", value: user?.email, icon: <FaEnvelope /> },
    { label: "Phone", value: user?.phone || "-", icon: <FaPhone /> },
    { label: "Assigned District (Admin Configured)", value: user?.district || "Not Assigned", icon: <FaMapMarkerAlt /> },
    { label: "Assigned State (Admin Configured)", value: user?.state || "Not Assigned", icon: <FaShieldAlt /> },
    { label: "Role Authority", value: user?.role || "OFFICER", icon: <FaShieldAlt /> },
    { label: "Officer ID", value: `#${user?.userId}`, icon: <FaKey /> },
    { label: "Joined", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-", icon: <FaEdit /> },
  ];

  return (
    <div className="officer-container">

      {/* Sidebar */}
      <aside className="officer-sidebar show-sidebar">
        <div className="sidebar-header">
          <h2>AgriSmart</h2>
          <p>Officer Portal</p>
        </div>
        <nav className="sidebar-menu">
          {MENU.map(item => (
            <div key={item.key} className={`sidebar-menu-item ${item.key === "profile" ? "active-menu" : ""}`} onClick={() => navigate(item.path)}>
              <div className="menu-icon">{item.icon}</div>
              <span>{item.name}</span>
            </div>
          ))}
          <div className="sidebar-menu-item sidebar-logout-item" onClick={handleLogout}>
            <div className="menu-icon"><FaSignOutAlt /></div>
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      <div className="dashboard-main">

        {/* Navbar */}
        <header className="dashboard-navbar">
          <div className="navbar-left">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input className="search-input" type="text" placeholder="Search..." readOnly />
            </div>
          </div>
          <div className="navbar-right">
            <button className="notification-btn" onClick={() => navigate("/officer/onification")}><FaBell /></button>
            <div className="profile-section">
              <FaUserCircle className="profile-avatar" />
              <div className="profile-info">
                <h4>{user?.name || "Officer"}</h4>
                <p>Agriculture Officer ({user?.district || "Region Assigned"})</p>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Header Banner */}
        <div style={{ background: "linear-gradient(135deg,#15803d,#166534)", borderRadius: 20, padding: "30px 36px", marginBottom: 28, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "4px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaUserCircle style={{ fontSize: 56, color: "#fff" }} />
          </div>
          <div>
            <h2 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 800 }}>{user?.name || "Officer"}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 8px", fontSize: 14 }}>Agriculture Officer · {user?.district || "Regional"} Jurisdiction</p>
            <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{user?.role || "OFFICER"}</span>
          </div>
          <button
            onClick={() => { setEditMode(!editMode); setEditName(user?.name || ""); setEditPhone(user?.phone || ""); }}
            style={{ marginLeft: "auto", padding: "10px 22px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.5)", background: "transparent", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            {editMode ? <><FaTimes /> Cancel Edit</> : <><FaEdit /> Edit Profile</>}
          </button>
        </div>

        {/* Profile Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28 }}>

          {/* Info or Edit Form */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            {!editMode ? (
              <>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Profile Information</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {infoItems.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                        <span style={{ color: "#16a34a" }}>{item.icon}</span>
                        {item.label}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>Edit Profile</h3>
                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Full Name *</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Assigned District (Admin Controlled)</label>
                    <input
                      type="text"
                      value={user?.district || "Not Assigned"}
                      disabled
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f1f5f9", color: "#64748b", fontSize: 13, boxSizing: "border-box", cursor: "not-allowed" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>Assigned State (Admin Controlled)</label>
                    <input
                      type="text"
                      value={user?.state || "Not Assigned"}
                      disabled
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f1f5f9", color: "#64748b", fontSize: 13, boxSizing: "border-box", cursor: "not-allowed" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setEditMode(false)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <FaSave /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Change Password */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <FaKey style={{ color: "#16a34a" }} /> Change Password
            </h3>
            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>New Password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <button
                type="submit"
                disabled={changingPw}
                style={{ padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: changingPw ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}
              >
                <FaKey /> {changingPw ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Session Logout */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #fee2e2", padding: "18px 24px", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Session Management</h4>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Sign out of your AgriSmart officer account securely.</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

      </div>
    </div>
  );
}