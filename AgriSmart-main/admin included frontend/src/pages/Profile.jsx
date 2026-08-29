import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "../styles/sid.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";

import {
  FaUser,
  FaTractor,
  FaFileAlt,
  FaLock,
  FaBell,
  FaLanguage,
  FaSignOutAlt,
  FaCheckCircle,
  FaUpload,
  FaSeedling,
  FaDownload,
  FaTrash,
  FaRedo,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";

import { setUser, logout, setDocuments } from "../main";
import { documentApi } from "../services/api";

const DOC_TYPES = [
  "Aadhaar Card",
  "Bank Passbook",
  "Land Records",
  "Soil Health Card",
  "Sowing Certificate",
  "PAN Card",
  "Caste Certificate",
  "Income Certificate",
  "Other",
];

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.agri.user);
  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);
  const possessedDocs = useSelector((state) => state.agri.possessedDocs) || [];
  const backendDocuments = useSelector((state) => state.agri.documents) || [];

  const [activeTab, setActiveTab] = useState("profile");

  // Document upload state
  const [uploadType,      setUploadType]      = useState(DOC_TYPES[0]);
  const [uploading,       setUploading]       = useState(false);
  const [replaceMode,     setReplaceMode]     = useState(null); // documentId being replaced
  const fileInputRef  = useRef(null);
  const replaceRef    = useRef(null);

  // Fetch documents on mount (when online)
  useEffect(() => {
    if (!demoMode && token) {
      documentApi.getMyDocuments(token)
        .then(docs => dispatch(setDocuments(Array.isArray(docs) ? docs : [])))
        .catch(() => {});
    }
  }, [token, demoMode]);

  // Upload handler
  const handleUpload = async (e, replaceDocId = null) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10MB)"); return; }

    // If replacing, first delete the old one
    if (replaceDocId) {
      try {
        await documentApi.delete(token, replaceDocId);
      } catch {}
    }

    setUploading(true);
    try {
      const result = await documentApi.upload(token, uploadType, file);
      const updated = await documentApi.getMyDocuments(token);
      dispatch(setDocuments(updated));
      toast.success(`"${uploadType}" uploaded successfully! Status: Pending verification.`);
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    }
    setUploading(false);
    setReplaceMode(null);
    e.target.value = "";
  };

  // Delete handler
  const handleDelete = async (docId, docType) => {
    if (!window.confirm(`Delete "${docType}"? This cannot be undone.`)) return;
    try {
      await documentApi.delete(token, docId);
      const updated = await documentApi.getMyDocuments(token);
      dispatch(setDocuments(updated));
      toast.success(`"${docType}" deleted.`);
    } catch (err) {
      toast.error("Delete failed: " + err.message);
    }
  };

  // Download handler
  const handleDownload = async (doc) => {
    try {
      await documentApi.download(token, doc.documentId, doc.originalFilename);
    } catch {
      toast.error("Download failed.");
    }
  };

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: user ? user.name : "Siddharth",
    phone: user ? (user.phone || "") : "9876543210",
    email: user ? user.email : "farmer@agrismart.com",
    district: user ? (user.district || "") : "Coimbatore",
    state: user ? (user.state || "") : "Tamil Nadu"
  });

  // Password Form States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notifications State
  const [notifSettings, setNotifSettings] = useState({
    emailNotif: true,
    smsNotif: true
  });

  // Soil Health Card Parameters State
  const [soilForm, setSoilForm] = useState({
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  ph: ""
});

useEffect(() => {

  const loadSoilHealth = async () => {

    if (!token) {
      console.log("Skipping soil health load: no token");
      return;
    }

    try {

      const response = await fetch(
        "http://localhost:8081/api/users/soil-health",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "Soil Health response status:",
        response.status
      );

      if (response.ok) {

        const data = await response.json();

        console.log(
          "SOIL HEALTH DATA FROM BACKEND:",
          data
        );

        setSoilForm({
          nitrogen: data.nitrogen ?? "",
          phosphorus: data.phosphorus ?? "",
          potassium: data.potassium ?? "",
          ph: data.ph ?? ""
        });

      } else {

        console.error(
          "Failed to load soil health:",
          response.status
        );

      }

    } catch (error) {

      console.error(
        "Failed to load soil health data:",
        error
      );

    }

  };

  loadSoilHealth();

}, [token]);


const handleSoilChange = (e) => {
  setSoilForm({
    ...soilForm,
    [e.target.name]: e.target.value
  });
};


const handleSoilSubmit = async (e) => {
  e.preventDefault();

  if (!token) {
  toast.error("Please login to save Soil Health data.");
  return;
}
  try {
    const response = await fetch(
      "http://localhost:8081/api/users/soil-health",
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          nitrogen: Number(soilForm.nitrogen),
          phosphorus: Number(soilForm.phosphorus),
          potassium: Number(soilForm.potassium),
          ph: Number(soilForm.ph)
        })
      }
    );

    if (response.ok) {

  const data = await response.json();

  console.log("SOIL HEALTH DATA FROM BACKEND:", data);

  setSoilForm({
    nitrogen: data.nitrogen ?? "",
    phosphorus: data.phosphorus ?? "",
    potassium: data.potassium ?? "",
    ph: data.ph ?? ""
  });

}

    const savedData = await response.json();

    setSoilForm({
      nitrogen: savedData.nitrogen,
      phosphorus: savedData.phosphorus,
      potassium: savedData.potassium,
      ph: savedData.ph
    });

    toast.success(
      "Soil Health Card parameters saved successfully!"
    );

  } catch (error) {
    console.error(error);

    toast.error(
      error.message || "Failed to save Soil Health data."
    );
  }
};

  // Documents list calculated from possessedDocs
  const checklistDocs = [
    { name: "Aadhaar Card", defaultDate: "12 Jun 2026" },
    { name: "Bank Passbook", defaultDate: "04 Jun 2026" },
    { name: "Land Records", defaultDate: "08 Jun 2026" },
    { name: "Soil Health Card", defaultDate: "10 Jun 2026" },
    { name: "Sowing Certificate", defaultDate: "14 Jun 2026" }
  ];

  const documents = checklistDocs.map(doc => {
    const isUploaded = possessedDocs.includes(doc.name);
    return {
      name: doc.name,
      status: isUploaded ? "Verified" : "Pending",
      uploaded: isUploaded ? doc.defaultDate : "-"
    };
  });

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: profileForm.name,
      phone: profileForm.phone,
      email: profileForm.email,
      district: profileForm.district,
      state: profileForm.state
    };

    try {
      if (!demoMode && token) {
        const res = await fetch("http://localhost:8081/api/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updatedUser = await res.json();
          dispatch(setUser(updatedUser));
          toast.success("Profile updated successfully in database!");
          return;
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to update profile.");
          return;
        }
      }
    } catch (err) {
      console.warn("User service offline, updating locally.", err);
    }

    dispatch(setUser({ ...user, ...payload }));
    toast.success("Profile details updated locally (Demo Mode)!");
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    const payload = {
      name: profileForm.name,
      phone: profileForm.phone,
      email: profileForm.email,
      district: profileForm.district,
      state: profileForm.state,
      password: passwordForm.newPassword
    };

    try {
      if (!demoMode && token) {
        const res = await fetch("http://localhost:8081/api/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          toast.success("Password updated successfully in database!");
          setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
          return;
        } else {
          toast.error("Failed to change password.");
          return;
        }
      }
    } catch (err) {
      console.warn("User service offline. Simulating password change.", err);
    }

    toast.success("Password changed locally (Demo Mode)!");
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleLogoutClick = () => {
    dispatch(logout());
    toast.success("Logged out successfully.");
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const memberSince = user && user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString([], { month: "long", year: "numeric" })
    : "June 2026";

  return (
    <>
      <Navbar />
      <FloatingAI />

      <div className="profilePage">
        <div className="settingsContainer">
          {/* SIDEBAR */}
          <div className="settingsSidebar">
            <h2>Account Settings</h2>
            <button
              className={activeTab === "profile" ? "activeTab" : ""}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser /> My Profile
            </button>
            <button onClick={() => navigate("/farm-management")}>
              <FaTractor /> My Farms
            </button>
            <button
              className={activeTab === "documents" ? "activeTab" : ""}
              onClick={() => setActiveTab("documents")}
            >
              <FaFileAlt /> Documents
            </button>
            <button
              className={activeTab === "soil" ? "activeTab" : ""}
              onClick={() => setActiveTab("soil")}
            >
              <FaSeedling /> Soil Health
            </button>
            <button
              className={activeTab === "security" ? "activeTab" : ""}
              onClick={() => setActiveTab("security")}
            >
              <FaLock /> Security
            </button>
            <button
              className={activeTab === "notifications" ? "activeTab" : ""}
              onClick={() => setActiveTab("notifications")}
            >
              <FaBell /> Notifications
            </button>
            <button
              className={activeTab === "language" ? "activeTab" : ""}
              onClick={() => setActiveTab("language")}
            >
              <FaLanguage /> Language
            </button>
            <button className="logoutSide" onClick={handleLogoutClick}>
              <FaSignOutAlt /> Logout
            </button>
          </div>

          {/* CONTENT */}
          <div className="settingsContent">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="contentCard">
                <h1>My Profile</h1>
                <p>Manage your personal information.</p>
                <div className="profileTop">
                  <div className="avatar">{getInitials(profileForm.name)}</div>
                  <div>
                    <h2>{profileForm.name}</h2>
                    <span className="verified">
                      <FaCheckCircle /> Verified {user ? user.role.toLowerCase() : "farmer"}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="profileForm">
                  <div className="inputGroup">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>District</label>
                    <input
                      type="text"
                      name="district"
                      value={profileForm.district}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={profileForm.state}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Member Since</label>
                    <input value={memberSince} disabled />
                  </div>
                  <button className="saveBtn" type="submit">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div className="contentCard">
                <div style={{ marginBottom: 20 }}>
                  <h1>My Documents</h1>
                  <p>Upload, view, and manage your identity and scheme documents. Officer verification happens after upload.</p>
                </div>

                {/* Upload Section */}
                {!demoMode && (
                  <div style={{ background: "#f0fdf4", border: "1.5px dashed #86efac", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
                    <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 800, color: "#15803d" }}>
                      <FaUpload style={{ marginRight: 8 }} />Upload New Document
                    </h3>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Document Type</label>
                        <select
                          value={uploadType}
                          onChange={e => setUploadType(e.target.value)}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #d1fae5", fontSize: 13, fontWeight: 600, color: "#334155", background: "#fff" }}
                        >
                          {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: "none" }}
                          onChange={e => handleUpload(e)}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          style={{
                            padding: "10px 20px", borderRadius: 10, border: "none",
                            background: uploading ? "#94a3b8" : "linear-gradient(135deg,#16a34a,#15803d)",
                            color: "#fff", fontWeight: 800, fontSize: 13, cursor: uploading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 8
                          }}
                        >
                          <FaUpload /> {uploading ? "Uploading..." : "Choose File & Upload"}
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 10, marginBottom: 0 }}>Accepted: PDF, JPEG, PNG · Max size: 10MB</p>
                  </div>
                )}

                {/* Hidden replace input */}
                <input
                  ref={replaceRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={e => handleUpload(e, replaceMode)}
                />

                {/* Document List */}
                {!demoMode && backendDocuments.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {backendDocuments.map(doc => {
                      const statusStyle = {
                        VERIFIED: { bg: "#dcfce7", color: "#15803d", icon: <FaCheckCircle /> },
                        PENDING:  { bg: "#fef3c7", color: "#b45309", icon: <FaHourglassHalf /> },
                        REJECTED: { bg: "#fee2e2", color: "#dc2626", icon: <FaTimesCircle /> },
                      }[doc.verificationStatus] || { bg: "#f1f5f9", color: "#64748b", icon: <FaFileAlt /> };

                      return (
                        <div key={doc.documentId} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px 18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaFileAlt style={{ color: "#16a34a", fontSize: 18 }} />
                              </div>
                              <div>
                                <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>{doc.documentType}</strong>
                                <span style={{ fontSize: 12, color: "#64748b" }}>{doc.originalFilename}</span><br />
                                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                                  {doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                                </span>
                              </div>
                            </div>
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: statusStyle.bg, color: statusStyle.color, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                              {statusStyle.icon} {doc.verificationStatus}
                            </span>
                          </div>
                          {doc.rejectionRemarks && (
                            <div style={{ fontSize: 12, color: "#dc2626", background: "#fff5f5", padding: "6px 10px", borderRadius: 8, border: "1px solid #fecdd3", marginBottom: 10 }}>
                              ⚠️ Rejection Reason: {doc.rejectionRemarks}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleDownload(doc)}
                              style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                            ><FaDownload /> Download</button>
                            <button
                              onClick={() => { setReplaceMode(doc.documentId); setUploadType(doc.documentType); replaceRef.current?.click(); }}
                              style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1.5px solid #dbeafe", background: "#eff6ff", color: "#2563eb", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                            ><FaRedo /> Replace</button>
                            <button
                              onClick={() => handleDelete(doc.documentId, doc.documentType)}
                              style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "1.5px solid #fee2e2", background: "#fff5f5", color: "#dc2626", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                            ><FaTrash /> Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !demoMode && backendDocuments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                    <FaFileAlt style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
                    <p style={{ fontWeight: 700, fontSize: 15 }}>No documents uploaded yet</p>
                    <p style={{ fontSize: 13 }}>Upload your Aadhaar Card, Land Records, etc. to boost scheme eligibility.</p>
                  </div>
                ) : (
                  /* Demo mode — show static checklist */
                  <div className="documentTable">
                    <div className="documentHead" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "12px", borderBottom: "2px solid #cbdcd0", fontWeight: "bold" }}>
                      <span>Document</span>
                      <span>Status</span>
                      <span>Uploaded</span>
                    </div>
                    {[
                      { name: "Aadhaar Card",      status: "Verified", uploaded: "12 Jun 2026" },
                      { name: "Bank Passbook",      status: "Pending",  uploaded: "04 Jun 2026" },
                      { name: "Land Records",       status: "Pending",  uploaded: "-"           },
                      { name: "Soil Health Card",   status: "Pending",  uploaded: "-"           },
                      { name: "Sowing Certificate", status: "Pending",  uploaded: "-"           },
                    ].map((doc, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "12px", borderBottom: "1px solid #e2f3e9", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <FaFileAlt style={{ color: "var(--primary)" }} />
                          <strong>{doc.name}</strong>
                        </div>
                        <span style={{ display: "inline-block", width: "fit-content", padding: "4px 8px", borderRadius: 12, fontSize: 12, background: doc.status === "Verified" ? "#dcfce7" : "#fef3c7", color: doc.status === "Verified" ? "#16a34a" : "#d97706" }}>
                          {doc.status}
                        </span>
                        <span style={{ fontSize: 13, color: "gray" }}>{doc.uploaded}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="contentCard">
                <h1>Security</h1>
                <p>Change your account password.</p>
                <form onSubmit={handleSecuritySubmit} className="profileForm">
                  <div className="inputGroup">
                    <label>Old Password</label>
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <button className="saveBtn" type="submit">
                    Change Password
                  </button>
                </form>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="contentCard">
                <h1>Notifications</h1>
                <p>Configure notification preferences.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={notifSettings.emailNotif}
                      onChange={(e) => setNotifSettings({ ...notifSettings, emailNotif: e.target.checked })}
                    />
                    <span>Receive Email alerts for severe weather updates</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={notifSettings.smsNotif}
                      onChange={(e) => setNotifSettings({ ...notifSettings, smsNotif: e.target.checked })}
                    />
                    <span>Receive SMS notifications for newly matching Government Schemes</span>
                  </label>
                  <button className="saveBtn" onClick={() => toast.success("Notification settings updated!")} style={{ marginTop: "10px", width: "fit-content" }}>
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* LANGUAGE TAB */}
            {activeTab === "language" && (
              <div className="contentCard">
                <h1>Language</h1>
                <p>Select your preferred interface language.</p>
                <div style={{ marginTop: "20px" }}>
                  <select style={{ width: "200px", padding: "10px", border: "1px solid #cbdcd0", borderRadius: "8px" }} onChange={(e) => toast.success(`Interface switched to ${e.target.options[e.target.selectedIndex].text}`)}>
                    <option value="en">English (Default)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="pun">ਪੰਜਾਬੀ (Punjabi)</option>
                  </select>
                </div>
              </div>
            )}

            {/* SOIL HEALTH CARD PARAMETERS TAB */}
            {activeTab === "soil" && (
              <div className="contentCard">
                <h1>Soil Health</h1>
                <p>Configure parameters from your physical Soil Health Card for NPK calculations.</p>
                <form onSubmit={handleSoilSubmit} className="profileForm">
                  <div className="inputGroup">
                    <label>Available Nitrogen (N - kg/ha)</label>
                    <input
                      type="number"
                      name="nitrogen"
                      value={soilForm.nitrogen}
                      onChange={handleSoilChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Available Phosphorus (P - kg/ha)</label>
                    <input
                      type="number"
                      name="phosphorus"
                      value={soilForm.phosphorus}
                      onChange={handleSoilChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Available Potassium (K - kg/ha)</label>
                    <input
                      type="number"
                      name="potassium"
                      value={soilForm.potassium}
                      onChange={handleSoilChange}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Soil pH level (0 - 14)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="ph"
                      value={soilForm.ph}
                      onChange={handleSoilChange}
                      required
                    />
                  </div>
                  <button className="saveBtn" type="submit">
                    Save Soil Parameters
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}