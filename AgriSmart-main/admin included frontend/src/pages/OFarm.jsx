import React, { useState, useEffect } from "react";
import "../styles/ofarm.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaBars, FaHome, FaUsers, FaTractor, FaClipboardList, FaBell,
  FaSearch, FaUserCircle, FaSignOutAlt, FaTimes,
  FaMapMarkerAlt, FaSeedling, FaMountain, FaTint, FaLeaf
} from "react-icons/fa";
import { MdAgriculture } from "react-icons/md";
import { setUser, setToken } from "../main";
import { farmApi, cropApi } from "../services/api";

const MENU = [
  { name: "Dashboard",     icon: <FaHome />,         path: "/officer/dashboard",   key: "dashboard" },
  { name: "Farmers",       icon: <FaUsers />,         path: "/officer/farmers",     key: "farmers"   },
  { name: "Farms & Crops", icon: <FaTractor />,       path: "/officer/ofarms",      key: "farms"     },
  { name: "Schemes",       icon: <FaClipboardList />, path: "/officer/oschemes",    key: "schemes"   },
  { name: "Broadcast",     icon: <FaBell />,          path: "/officer/onification", key: "notif"     },
  { name: "Profile",       icon: <FaUserCircle />,    path: "/officer/oprofile",    key: "profile"   },
];

const STATUS_BADGE = {
  ACTIVE:    { bg: "#dcfce7", color: "#15803d" },
  HARVESTED: { bg: "#dbeafe", color: "#1d4ed8" },
  FAILED:    { bg: "#fee2e2", color: "#dc2626" },
  PENDING:   { bg: "#fef3c7", color: "#b45309" },
};

export default function OFarm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user   = useSelector(s => s.agri.user);
  const token  = useSelector(s => s.agri.token);
  const reduxFarms = useSelector(s => s.agri.farms) || [];
  const reduxCrops = useSelector(s => s.agri.crops) || [];
  const usersList  = useSelector(s => s.agri.usersList) || [];

  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab,   setActiveTab]   = useState("farms");
  const [search,      setSearch]      = useState("");

  // Use Redux data (already fetched in App.jsx) — no re-fetch needed
  const farms = reduxFarms;
  const crops = reduxCrops;

  // Panel state
  const [selectedFarm,  setSelectedFarm]  = useState(null);
  const [selectedCrop,  setSelectedCrop]  = useState(null);

  const handleLogout = () => {
    dispatch(setUser(null));
    dispatch(setToken(null));
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  /* helpers */
  const getFarmerName = (userId) => {
    const f = usersList.find(u => u.userId === userId);
    return f?.name || `Farmer #${userId}`;
  };

  const getCropsForFarm = (farmId) => crops.filter(c => c.farmId === farmId);

  /* filtered lists */
  const q = search.toLowerCase();
  const filteredFarms = farms.filter(f =>
    (f.farmName || "").toLowerCase().includes(q) ||
    (f.location || "").toLowerCase().includes(q) ||
    (f.soilType || "").toLowerCase().includes(q)
  );
  const filteredCrops = crops.filter(c =>
    (c.cropName || "").toLowerCase().includes(q) ||
    (c.status || "").toLowerCase().includes(q)
  );

  return (
    <div className="officer-container">

      {/* Overlay */}
      <div className={`sidebar-overlay ${showSidebar ? "show-overlay" : ""}`} onClick={() => setShowSidebar(false)} />

      {/* Sidebar */}
      <aside className={`officer-sidebar ${showSidebar ? "show-sidebar" : ""}`}>
        <div className="sidebar-header">
          <h2>AgriSmart</h2>
          <p>Farms & Crops Desk</p>
        </div>
        <nav className="sidebar-menu">
          {MENU.map(item => (
            <div key={item.key} className={`sidebar-menu-item ${item.key === "farms" ? "active-menu" : ""}`} onClick={() => navigate(item.path)}>
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

      {/* Main */}
      <div className="dashboard-main">

        {/* Navbar */}
        <header className="dashboard-navbar">
          <div className="navbar-left">
            <div className="menu-toggle-btn" onClick={() => setShowSidebar(true)}><FaBars /></div>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                className="search-input"
                type="text"
                placeholder={activeTab === "farms" ? "Search farms..." : "Search crops..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="navbar-right">
            <button className="notification-btn" onClick={() => navigate("/officer/onification")}><FaBell /></button>
            <div className="profile-section" onClick={() => navigate("/officer/oprofile")} style={{ cursor: "pointer" }}>
              <FaUserCircle className="profile-avatar" />
              <div className="profile-info">
                <h4>{user?.name || "Officer"}</h4>
                <p>Agriculture Officer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stat Cards */}
        <section className="stats-section" style={{ marginBottom: 24 }}>
          {[
            { title: "Total Farms",   value: farms.length,                         icon: <MdAgriculture />, color: "#15803d", bg: "#dcfce7" },
            { title: "Total Crops",   value: crops.length,                          icon: <FaLeaf />,       color: "#f59e0b", bg: "#fef3c7" },
            { title: "Active Crops",  value: crops.filter(c => c.status === "ACTIVE").length, icon: <FaSeedling />, color: "#2563eb", bg: "#dbeafe" },
            { title: "Total Area",    value: `${farms.reduce((s, f) => s + (Number(f.area) || 0), 0).toFixed(1)} ac`, icon: <FaMapMarkerAlt />, color: "#8b5cf6", bg: "#ede9fe" },
          ].map((s, i) => (
            <div key={i} className="stats-card">
              <div className="stats-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stats-content"><h4>{s.title}</h4><h2>{s.value}</h2></div>
            </div>
          ))}
        </section>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f1f5f9", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {[
            { key: "farms", label: `Farms (${farms.length})` },
            { key: "crops", label: `Crops (${crops.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedFarm(null); setSelectedCrop(null); setSearch(""); }}
              style={{
                padding: "8px 22px", borderRadius: 10, border: "none", fontWeight: 700,
                fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                background: activeTab === tab.key ? "#16a34a" : "transparent",
                color: activeTab === tab.key ? "#fff" : "#64748b",
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Content: Two-column layout when item selected */}
        <div style={{ display: "grid", gridTemplateColumns: selectedFarm || selectedCrop ? "1fr 1fr" : "1fr", gap: 24 }}>

          {/* Left: Table */}
          <div className="farmer-table-container">
            {activeTab === "farms" ? (
              <>
                <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: "#0f172a", fontSize: 14 }}>{filteredFarms.length} farms</strong>
                </div>
                {filteredFarms.length > 0 ? (
                  <table className="farmer-table">
                    <thead>
                      <tr>
                        <th>Farm Name</th>
                        <th>Owner</th>
                        <th>Area</th>
                        <th>Soil Type</th>
                        <th>Water Source</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarms.map(f => (
                        <tr
                          key={f.farmId}
                          style={{ cursor: "pointer", background: selectedFarm?.farmId === f.farmId ? "#f0fdf4" : "" }}
                          onClick={() => { setSelectedFarm(f); setSelectedCrop(null); }}
                        >
                          <td><strong>{f.farmName}</strong></td>
                          <td>{getFarmerName(f.userId)}</td>
                          <td>{f.area} ac</td>
                          <td>{f.soilType || "-"}</td>
                          <td>{f.waterSource || "-"}</td>
                          <td>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                              <FaMapMarkerAlt style={{ color: "#16a34a", fontSize: 10 }} />
                              {f.location || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>No farms found</div>
                )}
              </>
            ) : (
              /* Crops Table */
              <>
                <div style={{ marginBottom: 14 }}>
                  <strong style={{ color: "#0f172a", fontSize: 14 }}>{filteredCrops.length} crops</strong>
                </div>
                {filteredCrops.length > 0 ? (
                  <table className="farmer-table">
                    <thead>
                      <tr>
                        <th>Crop Name</th>
                        <th>Farmer</th>
                        <th>Farm</th>
                        <th>Status</th>
                        <th>Planted</th>
                        <th>Harvest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCrops.map(c => {
                        const parentFarm = farms.find(f => f.farmId === c.farmId);
                        const badge = STATUS_BADGE[c.status] || STATUS_BADGE.PENDING;
                        return (
                          <tr
                            key={c.cropId}
                            style={{ cursor: "pointer", background: selectedCrop?.cropId === c.cropId ? "#f0fdf4" : "" }}
                            onClick={() => { setSelectedCrop(c); setSelectedFarm(null); }}
                          >
                            <td><strong>{c.cropName}</strong></td>
                            <td>{getFarmerName(parentFarm?.userId)}</td>
                            <td>{parentFarm?.farmName || "-"}</td>
                            <td>
                              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color }}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: "#64748b" }}>{c.plantedDate || "-"}</td>
                            <td style={{ fontSize: 12, color: "#64748b" }}>{c.expectedHarvestDate || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>No crops found</div>
                )}
              </>
            )}
          </div>

          {/* Right: Detail Panel */}
          {(selectedFarm || selectedCrop) && (
            <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", alignSelf: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  {selectedFarm ? selectedFarm.farmName : selectedCrop?.cropName}
                </h3>
                <button onClick={() => { setSelectedFarm(null); setSelectedCrop(null); }} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>
                  <FaTimes />
                </button>
              </div>

              {selectedFarm && (
                <>
                  {/* Farm Details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {[
                      { label: "Owner",       value: getFarmerName(selectedFarm.userId) },
                      { label: "Area",        value: `${selectedFarm.area} acres` },
                      { label: "Soil Type",   value: selectedFarm.soilType || "-" },
                      { label: "Water Source",value: selectedFarm.waterSource || "-" },
                      { label: "Location",    value: selectedFarm.location || "-" },
                      { label: "Coordinates", value: selectedFarm.latitude ? `${selectedFarm.latitude}°N, ${selectedFarm.longitude}°E` : "-" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                        <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Map */}
                  {selectedFarm.latitude && selectedFarm.longitude && (
                    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 20 }}>
                      <iframe
                        title="Farm Location"
                        width="100%"
                        height="200"
                        style={{ border: "none" }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedFarm.longitude - 0.01},${selectedFarm.latitude - 0.01},${selectedFarm.longitude + 0.01},${selectedFarm.latitude + 0.01}&layer=mapnik&marker=${selectedFarm.latitude},${selectedFarm.longitude}`}
                      />
                    </div>
                  )}

                  {/* Registered crops */}
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10 }}>Registered Crops ({getCropsForFarm(selectedFarm.farmId).length})</h4>
                    {getCropsForFarm(selectedFarm.farmId).length === 0 ? (
                      <p style={{ fontSize: 13, color: "#94a3b8" }}>No crops registered on this farm.</p>
                    ) : getCropsForFarm(selectedFarm.farmId).map(c => {
                      const badge = STATUS_BADGE[c.status] || STATUS_BADGE.PENDING;
                      return (
                        <div key={c.cropId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f0fdf4", borderRadius: 9, marginBottom: 6, border: "1px solid #bbf7d0" }}>
                          <strong style={{ fontSize: 13, color: "#15803d" }}>{c.cropName}</strong>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: badge.bg, color: badge.color }}>{c.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {selectedCrop && (() => {
                const parentFarm = farms.find(f => f.farmId === selectedCrop.farmId);
                const badge = STATUS_BADGE[selectedCrop.status] || STATUS_BADGE.PENDING;
                return (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                      {[
                        { label: "Farmer",          value: getFarmerName(parentFarm?.userId) },
                        { label: "Farm",            value: parentFarm?.farmName || "-" },
                        { label: "Status",          value: <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color }}>{selectedCrop.status}</span> },
                        { label: "Planted Date",    value: selectedCrop.plantedDate || "-" },
                        { label: "Expected Harvest",value: selectedCrop.expectedHarvestDate || "-" },
                        { label: "Duration",        value: selectedCrop.duration ? `${selectedCrop.duration} days` : "-" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Parent Farm Map */}
                    {parentFarm?.latitude && parentFarm?.longitude && (
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10 }}>Farm Location</h4>
                        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                          <iframe
                            title="Crop Farm Location"
                            width="100%"
                            height="180"
                            style={{ border: "none" }}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${parentFarm.longitude - 0.01},${parentFarm.latitude - 0.01},${parentFarm.longitude + 0.01},${parentFarm.latitude + 0.01}&layer=mapnik&marker=${parentFarm.latitude},${parentFarm.longitude}`}
                          />
                        </div>
                        {selectedCrop.description && (
                          <p style={{ marginTop: 12, fontSize: 13, color: "#475569", background: "#f8fafc", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                            {selectedCrop.description}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}