import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "../styles/sid.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";
import { userApi } from "../services/api";

import {
  FaUser,
  FaTractor,
  FaFileAlt,
  FaLock,
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
  FaMapMarkerAlt,
  FaTree,
  FaRupeeSign,
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
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.agri.user);
  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);
  const possessedDocs = useSelector((state) => state.agri.possessedDocs) || [];
  const backendDocuments = useSelector((state) => state.agri.documents) || [];

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "profile");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

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

  // Profile Form States (End-to-End Field Mapping)
  const [profileForm, setProfileForm] = useState({
    name: user ? (user.name || "") : "Siddharth",
    phone: user ? (user.phone || "") : "9876543210",
    email: user ? (user.email || "") : "farmer@agrismart.com",
    dob: user ? (user.dob || "") : "",
    gender: user ? (user.gender || "Male") : "Male",

    state: user ? (user.state || "") : "Tamil Nadu",
    district: user ? (user.district || "") : "Coimbatore",
    taluk: user ? (user.taluk || "") : "Pollachi",
    village: user ? (user.village || "") : "Anaimalai",
    pincode: user ? (user.pincode || "") : "642001",

    landOwnershipType: user ? (user.landOwnershipType || "Owned") : "Owned",
    totalLandholding: user && user.totalLandholding != null ? String(user.totalLandholding) : "5.5",
    farmerCategory: user ? (user.farmerCategory || "Small (2.5 - 5 Acres / 1-2 Ha)") : "Small (2.5 - 5 Acres / 1-2 Ha)",
    ownershipDocumentAvailable: user && user.ownershipDocumentAvailable != null ? String(user.ownershipDocumentAvailable) : "true",

    annualIncomeRange: user ? (user.annualIncomeRange || "₹1,00,000 - ₹3,00,000") : "₹1,00,000 - ₹3,00,000",
    incomeCertificateAvailable: user && user.incomeCertificateAvailable != null ? String(user.incomeCertificateAvailable) : "true",

    hasTractor: user ? Boolean(user.hasTractor) : true,
    hasMachinery: user ? Boolean(user.hasMachinery) : true,
    hasIrrigationEquipment: user ? Boolean(user.hasIrrigationEquipment) : true,
    hasPumpSet: user ? Boolean(user.hasPumpSet) : true,
    hasStorageFacility: user ? Boolean(user.hasStorageFacility) : false,
    hasGreenhouse: user ? Boolean(user.hasGreenhouse) : false,

    farmingType: user ? (user.farmingType || "Conventional Farming") : "Conventional Farming",
    yearsFarming: user && user.yearsFarming != null ? String(user.yearsFarming) : "12",
    organizationMembership: user ? (user.organizationMembership || "Farmer Producer Org (FPO)") : "Farmer Producer Org (FPO)"
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        dob: user.dob || "",
        gender: user.gender || "Male",

        state: user.state || "",
        district: user.district || "",
        taluk: user.taluk || "",
        village: user.village || "",
        pincode: user.pincode || "",

        landOwnershipType: user.landOwnershipType || "Owned",
        totalLandholding: user.totalLandholding != null ? String(user.totalLandholding) : "",
        farmerCategory: user.farmerCategory || "Small (2.5 - 5 Acres / 1-2 Ha)",
        ownershipDocumentAvailable: user.ownershipDocumentAvailable != null ? String(user.ownershipDocumentAvailable) : "true",

        annualIncomeRange: user.annualIncomeRange || "₹1,00,000 - ₹3,00,000",
        incomeCertificateAvailable: user.incomeCertificateAvailable != null ? String(user.incomeCertificateAvailable) : "true",

        hasTractor: Boolean(user.hasTractor),
        hasMachinery: Boolean(user.hasMachinery),
        hasIrrigationEquipment: Boolean(user.hasIrrigationEquipment),
        hasPumpSet: Boolean(user.hasPumpSet),
        hasStorageFacility: Boolean(user.hasStorageFacility),
        hasGreenhouse: Boolean(user.hasGreenhouse),

        farmingType: user.farmingType || "Conventional Farming",
        yearsFarming: user.yearsFarming != null ? String(user.yearsFarming) : "",
        organizationMembership: user.organizationMembership || "None"
      });
    }
  }, [user]);

  // Password Form States
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Soil Health Card Parameters State
  const [soilForm, setSoilForm] = useState(() => ({
    nitrogen: user?.nitrogen ? String(user.nitrogen) : "60",
    phosphorus: user?.phosphorus ? String(user.phosphorus) : "40",
    potassium: user?.potassium ? String(user.potassium) : "50",
    soilPh: user?.soilPh ? String(user.soilPh) : "6.5",
    ph: user?.soilPh ? String(user.soilPh) : "6.5",
    soilMoisture: user?.soilMoisture ? String(user.soilMoisture) : "35.0",
    organicCarbon: user?.organicCarbon ? String(user.organicCarbon) : "1.0",
    electricalConductivity: user?.electricalConductivity ? String(user.electricalConductivity) : "1.0"
  }));

  useEffect(() => {
    if (user) {
      setSoilForm({
        nitrogen: user.nitrogen != null ? String(user.nitrogen) : "60",
        phosphorus: user.phosphorus != null ? String(user.phosphorus) : "40",
        potassium: user.potassium != null ? String(user.potassium) : "50",
        soilPh: user.soilPh != null ? String(user.soilPh) : "6.5",
        ph: user.soilPh != null ? String(user.soilPh) : "6.5",
        soilMoisture: user.soilMoisture != null ? String(user.soilMoisture) : "35.0",
        organicCarbon: user.organicCarbon != null ? String(user.organicCarbon) : "1.0",
        electricalConductivity: user.electricalConductivity != null ? String(user.electricalConductivity) : "1.0"
      });
    }
  }, [user]);

  const handleSoilChange = (e) => {
    setSoilForm({
      ...soilForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSoilSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem("soil_health_parameters", JSON.stringify(soilForm));
    if (!demoMode && token) {
      try {
        const payload = {
          name: profileForm.name,
          phone: profileForm.phone,
          district: profileForm.district,
          state: profileForm.state,
          nitrogen: parseFloat(soilForm.nitrogen || 60),
          phosphorus: parseFloat(soilForm.phosphorus || 40),
          potassium: parseFloat(soilForm.potassium || 50),
          soilPh: parseFloat(soilForm.soilPh || soilForm.ph || 6.5),
          soilMoisture: parseFloat(soilForm.soilMoisture || 35),
          organicCarbon: parseFloat(soilForm.organicCarbon || 1.0),
          electricalConductivity: parseFloat(soilForm.electricalConductivity || 1.0)
        };
        const updated = await userApi.updateProfile(token, payload);
        if (updated) dispatch(setUser(updated));
        toast.success("Soil Health parameters saved to database!");
        return;
      } catch (err) {
        console.warn("Failed to sync soil health with backend", err);
      }
    }
    toast.success("Soil Health Card parameters saved successfully!");
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
    const { name, type, checked, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
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
      state: profileForm.state,
      dob: profileForm.dob,
      gender: profileForm.gender,
      taluk: profileForm.taluk,
      village: profileForm.village,
      pincode: profileForm.pincode,
      landOwnershipType: profileForm.landOwnershipType,
      totalLandholding: profileForm.totalLandholding !== "" ? parseFloat(profileForm.totalLandholding) : null,
      farmerCategory: profileForm.farmerCategory,
      ownershipDocumentAvailable: profileForm.ownershipDocumentAvailable === "true" || profileForm.ownershipDocumentAvailable === true,
      annualIncomeRange: profileForm.annualIncomeRange,
      incomeCertificateAvailable: profileForm.incomeCertificateAvailable === "true" || profileForm.incomeCertificateAvailable === true,
      hasTractor: Boolean(profileForm.hasTractor),
      hasMachinery: Boolean(profileForm.hasMachinery),
      hasIrrigationEquipment: Boolean(profileForm.hasIrrigationEquipment),
      hasPumpSet: Boolean(profileForm.hasPumpSet),
      hasStorageFacility: Boolean(profileForm.hasStorageFacility),
      hasGreenhouse: Boolean(profileForm.hasGreenhouse),
      farmingType: profileForm.farmingType,
      yearsFarming: profileForm.yearsFarming !== "" ? parseInt(profileForm.yearsFarming, 10) : null,
      organizationMembership: profileForm.organizationMembership
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
          const err = await res.json().catch(() => ({}));
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
                <p>Manage your end-to-end farmer profile information across 6 structured categories.</p>
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

                  {/* SECTION 1: PERSONAL INFORMATION */}
                  <div style={{ margin: "24px 0 16px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#15803d", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaUser /> 1. Personal Information
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
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
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={profileForm.dob}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="inputGroup">
                      <label>Gender</label>
                      <select name="gender" value={profileForm.gender} onChange={handleProfileChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
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
                        disabled
                      />
                    </div>
                  </div>

                  {/* SECTION 2: LOCATION DETAILS */}
                  <div style={{ margin: "28px 0 16px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#15803d", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaMapMarkerAlt /> 2. Location Details
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
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
                      <label>Taluk / Block</label>
                      <input
                        type="text"
                        name="taluk"
                        value={profileForm.taluk}
                        onChange={handleProfileChange}
                        placeholder="e.g. Pollachi"
                      />
                    </div>
                    <div className="inputGroup">
                      <label>Village / Panchayat</label>
                      <input
                        type="text"
                        name="village"
                        value={profileForm.village}
                        onChange={handleProfileChange}
                        placeholder="e.g. Anaimalai"
                      />
                    </div>
                    <div className="inputGroup">
                      <label>PIN Code</label>
                      <input
                        type="text"
                        name="pincode"
                        value={profileForm.pincode}
                        onChange={handleProfileChange}
                        placeholder="e.g. 642001"
                      />
                    </div>
                  </div>

                  {/* SECTION 3: LAND / FARMER INFORMATION */}
                  <div style={{ margin: "28px 0 16px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#15803d", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaTree /> 3. Land / Farmer Information
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    <div className="inputGroup">
                      <label>Land Ownership Type</label>
                      <select name="landOwnershipType" value={profileForm.landOwnershipType} onChange={handleProfileChange}>
                        <option value="Owned">Owned</option>
                        <option value="Leased">Leased</option>
                        <option value="Sharecropped">Sharecropped</option>
                        <option value="Joint Ownership">Joint Ownership</option>
                      </select>
                    </div>
                    <div className="inputGroup">
                      <label>Total Landholding (Acres)</label>
                      <input
                        type="number"
                        step="any"
                        name="totalLandholding"
                        value={profileForm.totalLandholding}
                        onChange={handleProfileChange}
                        placeholder="e.g. 5.5"
                      />
                    </div>
                    <div className="inputGroup">
                      <label>Farmer Category</label>
                      <select name="farmerCategory" value={profileForm.farmerCategory} onChange={handleProfileChange}>
                        <option value="Marginal (< 2.5 Acres / 1 Ha)">Marginal (&lt; 2.5 Acres / 1 Ha)</option>
                        <option value="Small (2.5 - 5 Acres / 1-2 Ha)">Small (2.5 - 5 Acres / 1-2 Ha)</option>
                        <option value="Semi-Medium (5 - 10 Acres / 2-4 Ha)">Semi-Medium (5 - 10 Acres / 2-4 Ha)</option>
                        <option value="Medium (10 - 25 Acres / 4-10 Ha)">Medium (10 - 25 Acres / 4-10 Ha)</option>
                        <option value="Large (> 25 Acres / > 10 Ha)">Large (&gt; 25 Acres / &gt; 10 Ha)</option>
                      </select>
                    </div>
                    <div className="inputGroup">
                      <label>Ownership Document Available</label>
                      <select name="ownershipDocumentAvailable" value={String(profileForm.ownershipDocumentAvailable)} onChange={handleProfileChange}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  {/* SECTION 4: FINANCIAL INFORMATION */}
                  <div style={{ margin: "28px 0 16px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#15803d", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaRupeeSign /> 4. Financial Information
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    <div className="inputGroup">
                      <label>Annual Family Income Range</label>
                      <select name="annualIncomeRange" value={profileForm.annualIncomeRange} onChange={handleProfileChange}>
                        <option value="< ₹1,00,000">&lt; ₹1,00,000</option>
                        <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000</option>
                        <option value="₹3,00,000 - ₹5,00,000">₹3,00,000 - ₹5,00,000</option>
                        <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000</option>
                        <option value="> ₹10,00,000">&gt; ₹10,00,000</option>
                      </select>
                    </div>
                    <div className="inputGroup">
                      <label>Income Certificate Available</label>
                      <select name="incomeCertificateAvailable" value={String(profileForm.incomeCertificateAvailable)} onChange={handleProfileChange}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  {/* SECTION 5: FARM ASSETS */}
                  <div style={{ margin: "28px 0 16px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#15803d", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaTractor /> 5. Farm Assets
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#334155" }}>
                      <input type="checkbox" name="hasTractor" checked={profileForm.hasTractor} onChange={handleProfileChange} style={{ width: 18, height: 18, accentColor: "#16a34a" }} />
                      Tractor
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#334155" }}>
                      <input type="checkbox" name="hasMachinery" checked={profileForm.hasMachinery} onChange={handleProfileChange} style={{ width: 18, height: 18, accentColor: "#16a34a" }} />
                      Agricultural Machinery
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#334155" }}>
                      <input type="checkbox" name="hasIrrigationEquipment" checked={profileForm.hasIrrigationEquipment} onChange={handleProfileChange} style={{ width: 18, height: 18, accentColor: "#16a34a" }} />
                      Irrigation Equipment
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#334155" }}>
                      <input type="checkbox" name="hasPumpSet" checked={profileForm.hasPumpSet} onChange={handleProfileChange} style={{ width: 18, height: 18, accentColor: "#16a34a" }} />
                      Pump Set
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#334155" }}>
                      <input type="checkbox" name="hasStorageFacility" checked={profileForm.hasStorageFacility} onChange={handleProfileChange} style={{ width: 18, height: 18, accentColor: "#16a34a" }} />
                      Storage Facility
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#334155" }}>
                      <input type="checkbox" name="hasGreenhouse" checked={profileForm.hasGreenhouse} onChange={handleProfileChange} style={{ width: 18, height: 18, accentColor: "#16a34a" }} />
                      Greenhouse / Polyhouse
                    </label>
                  </div>

                  {/* SECTION 6: FARMING BACKGROUND */}
                  <div style={{ margin: "28px 0 16px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#15803d", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaSeedling /> 6. Farming Background
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                    <div className="inputGroup">
                      <label>Type of Farming</label>
                      <select name="farmingType" value={profileForm.farmingType} onChange={handleProfileChange}>
                        <option value="Organic Farming">Organic Farming</option>
                        <option value="Conventional Farming">Conventional Farming</option>
                        <option value="Natural / Zero Budget">Natural / Zero Budget</option>
                        <option value="Mixed Farming">Mixed Farming</option>
                        <option value="Hydroponic / Vertical">Hydroponic / Vertical</option>
                      </select>
                    </div>
                    <div className="inputGroup">
                      <label>Number of Years Farming</label>
                      <input
                        type="number"
                        name="yearsFarming"
                        value={profileForm.yearsFarming}
                        onChange={handleProfileChange}
                        placeholder="e.g. 12"
                      />
                    </div>
                    <div className="inputGroup">
                      <label>Group / Organization Membership</label>
                      <select name="organizationMembership" value={profileForm.organizationMembership} onChange={handleProfileChange}>
                        <option value="Farmer Producer Org (FPO)">Farmer Producer Org (FPO)</option>
                        <option value="Self Help Group (SHG)">Self Help Group (SHG)</option>
                        <option value="Cooperative Society">Cooperative Society</option>
                        <option value="Farmer Club">Farmer Club</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: 32 }}>
                    <button className="saveBtn" type="submit">
                      Save Profile Changes
                    </button>
                  </div>
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
                <p>Manage your account password.</p>
                <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px", maxWidth: "400px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "13px" }}>Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbdcd0", borderRadius: "8px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "13px" }}>New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbdcd0", borderRadius: "8px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "13px" }}>Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      style={{ width: "100%", padding: "10px", border: "1px solid #cbdcd0", borderRadius: "8px" }}
                    />
                  </div>
                  <button type="submit" className="saveBtn" style={{ marginTop: "10px" }}>
                    Change Password
                  </button>
                </form>
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
                <h1>Soil Health & Nutrients</h1>
                <p>Configure parameters from your Soil Health Card to feed the AI Fertilizer & Irrigation models.</p>
                <form onSubmit={handleSoilSubmit} className="profileForm">
                  <div className="inputGroup">
                    <label>Available Nitrogen (N - kg/ha)</label>
                    <input
                      type="number"
                      step="0.1"
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
                      step="0.1"
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
                      step="0.1"
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
                      value={soilForm.ph || soilForm.soilPh}
                      onChange={e => {
                        handleSoilChange(e);
                        setSoilForm(prev => ({ ...prev, soilPh: e.target.value, ph: e.target.value }));
                      }}
                      required
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Soil Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="soilMoisture"
                      value={soilForm.soilMoisture}
                      onChange={handleSoilChange}
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Organic Carbon (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="organicCarbon"
                      value={soilForm.organicCarbon}
                      onChange={handleSoilChange}
                    />
                  </div>
                  <div className="inputGroup">
                    <label>Electrical Conductivity (EC - dS/m)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="electricalConductivity"
                      value={soilForm.electricalConductivity}
                      onChange={handleSoilChange}
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