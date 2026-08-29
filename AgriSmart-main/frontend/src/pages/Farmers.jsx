import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../styles/ofarmers.css";
import "../styles/ofarm.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaBars, FaHome, FaUsers, FaClipboardList, FaBell,
  FaSearch, FaUserCircle, FaSignOutAlt, FaEye, FaTimes,
  FaCheckCircle, FaTimesCircle, FaDownload,
  FaFileAlt, FaSeedling, FaMapMarkerAlt, FaLeaf
} from "react-icons/fa";
import { MdAgriculture } from "react-icons/md";
import { setUser, setToken } from "../main";
import { documentApi, schemeApi, userApi, analyticsApi } from "../services/api";
import LeafletViewer from "../components/LeafletViewer";
import {
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";

const MENU = [
  { name: "Dashboard",     icon: <FaHome />,         path: "/officer/dashboard",   key: "dashboard" },
  { name: "Farmers",       icon: <FaUsers />,         path: "/officer/farmers",     key: "farmers"   },
  { name: "Schemes",       icon: <FaClipboardList />, path: "/officer/oschemes",    key: "schemes"   },
  { name: "Broadcast",     icon: <FaBell />,          path: "/officer/onification", key: "notif"     },
  { name: "Profile",       icon: <FaUserCircle />,    path: "/officer/oprofile",    key: "profile"   },
];

const COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

const STATUS_COLORS = {
  VERIFIED: { bg: "#dcfce7", color: "#15803d" },
  PENDING:  { bg: "#fef3c7", color: "#b45309" },
  REJECTED: { bg: "#fee2e2", color: "#dc2626" },
};

const STATUS_BADGE = {
  ACTIVE:    { bg: "#dcfce7", color: "#15803d" },
  HARVESTED: { bg: "#dbeafe", color: "#1d4ed8" },
  FAILED:    { bg: "#fee2e2", color: "#dc2626" },
  PENDING:   { bg: "#fef3c7", color: "#b45309" },
};

export default function Farmers() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Redux values
  const user       = useSelector(s => s.agri.user);
  const token      = useSelector(s => s.agri.token);
  const farms      = useSelector(s => s.agri.farms)    || [];
  const crops      = useSelector(s => s.agri.crops)    || [];
  const reduxUsers = useSelector(s => s.agri.usersList) || [];

  // Farmers Directory State
  const [showSidebar,      setShowSidebar]      = useState(false);
  const [farmerSearch,     setFarmerSearch]     = useState(searchParams.get("search") || "");
  const [districtFilter,   setDistrictFilter]   = useState("All");
  const [farmers,          setFarmers]          = useState([]);
  const [loading,          setLoading]          = useState(true);

  // Farmer Detail Drawer State
  const [drawerOpen,       setDrawerOpen]       = useState(false);
  const [selectedFarmer,   setSelectedFarmer]   = useState(null);
  const [drawerTab,        setDrawerTab]        = useState("info");
  const [farmerFarms,      setFarmerFarms]      = useState([]);
  const [farmerCrops,      setFarmerCrops]      = useState([]);
  const [farmerDocs,       setFarmerDocs]       = useState([]);
  const [farmerApps,       setFarmerApps]       = useState([]);
  const [drawerLoading,    setDrawerLoading]    = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Farms & Crops Desk State
  const [activeTab,   setActiveTab]   = useState("farms");
  const [farmSearch,  setFarmSearch]  = useState("");
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [analytics,    setAnalytics]    = useState(null);

  /* ── Fetch farmers from API ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    userApi.getAllFarmers(token)
      .then(data => {
        setFarmers(Array.isArray(data) ? data : (data?.content || reduxUsers.filter(u => u.role === "FARMER")));
        setLoading(false);
      })
      .catch(() => {
        setFarmers(reduxUsers.filter(u => u.role === "FARMER"));
        setLoading(false);
      });
  }, [token]);

  /* ── Fetch officer analytics from API ── */
  useEffect(() => {
    if (!token) return;
    analyticsApi.getOfficerAnalytics(token)
      .then(data => setAnalytics(data))
      .catch(() => {});
  }, [token]);

  /* ── Open farmer drawer ── */
  const openDrawer = useCallback(async (farmer) => {
    setSelectedFarmer(farmer);
    setDrawerOpen(true);
    setDrawerTab("info");
    setDrawerLoading(true);

    try {
      const [docs, apps] = await Promise.all([
        documentApi.getUserDocuments(token, farmer.userId).catch(() => []),
        schemeApi.getUserApplications(token, farmer.userId).catch(() => []),
      ]);
      setFarmerDocs(Array.isArray(docs) ? docs : []);
      setFarmerApps(Array.isArray(apps) ? apps : []);
    } catch (e) {
      setFarmerDocs([]);
      setFarmerApps([]);
    }

    setFarmerFarms(farms.filter(f => f.userId === farmer.userId || f.farmerId === farmer.userId));
    setFarmerCrops(crops.filter(c => {
      const ff = farms.filter(f => f.userId === farmer.userId || f.farmerId === farmer.userId);
      return ff.some(f => f.farmId === c.farmId);
    }));

    setDrawerLoading(false);
  }, [token, farms, crops]);

  /* ── Verify / Reject document ── */
  const handleVerifyDoc = async (docId, status) => {
    try {
      const updated = await documentApi.verify(token, docId, status);
      setFarmerDocs(prev => prev.map(d => d.documentId === docId ? updated : d));
      toast.success(`Document ${status === "VERIFIED" ? "verified" : "rejected"} successfully.`);
    } catch (e) {
      toast.error("Failed to update document status.");
    }
  };

  /* ── Download document ── */
  const handleDownload = async (doc) => {
    try {
      await documentApi.download(token, doc.documentId, doc.originalFilename);
    } catch (e) {
      toast.error("Download failed.");
    }
  };

  /* ── Logout ── */
  const handleLogout = () => {
    dispatch(setUser(null));
    dispatch(setToken(null));
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  /* ── Farmers filter & pagination ── */
  const districts = ["All", ...new Set(farmers.map(f => f.district).filter(Boolean))];

  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const q = farmerSearch.toLowerCase();
      const matchName  = (f.name || "").toLowerCase().includes(q);
      const matchPhone = (f.phone || "").includes(q);
      const matchDist  = (f.district || "").toLowerCase().includes(q);
      const matchDistrFilter = districtFilter === "All" || f.district === districtFilter;
      return (matchName || matchPhone || matchDist) && matchDistrFilter;
    });
  }, [farmers, farmerSearch, districtFilter]);

  const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);
  const paginatedFarmers = useMemo(() => {
    return filteredFarmers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredFarmers, currentPage]);

  const getFarmerFarmCount = (userId) => farms.filter(f => f.userId === userId || f.farmerId === userId).length;
  const getFarmerArea = (userId) => farms.filter(f => f.userId === userId || f.farmerId === userId).reduce((s, f) => s + (Number(f.area) || 0), 0).toFixed(1);

  // Farms & Crops Desk Helpers
  const getFarmerName = (userId) => {
    const f = reduxUsers.find(u => u.userId === userId);
    return f?.name || `Farmer #${userId}`;
  };

  const getCropsForFarm = (farmId) => crops.filter(c => c.farmId === farmId);

  // Sub-table search filters
  const fQuery = farmSearch.toLowerCase();
  const filteredFarms = useMemo(() => {
    return farms.filter(f =>
      (f.farmName || "").toLowerCase().includes(fQuery) ||
      (f.location || "").toLowerCase().includes(fQuery) ||
      (f.soilType || "").toLowerCase().includes(fQuery)
    );
  }, [farms, fQuery]);

  const filteredCrops = useMemo(() => {
    return crops.filter(c =>
      (c.cropName || "").toLowerCase().includes(fQuery) ||
      (c.status || "").toLowerCase().includes(fQuery)
    );
  }, [crops, fQuery]);

  // Analytics derivation
  const cropDist = analytics?.cropDistribution || [];
  const soilDist = analytics?.soilDistribution || [];

  const cropBarData = useMemo(() => {
    return cropDist.map((d, i) => ({
      crop: d.name || d.crop_name || "",
      count: Number(d.value || d.count || 0),
      color: COLORS[i % COLORS.length]
    }));
  }, [cropDist]);

  const soilPieData = useMemo(() => {
    return soilDist.map(d => ({
      name: d.name || d.soil_type || "",
      value: Number(d.value || d.count || 0)
    }));
  }, [soilDist]);

  return (
    <div className="officer-container">
      {/* Overlay */}
      <div className={`sidebar-overlay ${showSidebar ? "show-overlay" : ""}`} onClick={() => setShowSidebar(false)} />

      {/* Sidebar */}
      <aside className={`officer-sidebar ${showSidebar ? "show-sidebar" : ""}`}>
        <div className="sidebar-header">
          <h2>AgriSmart</h2>
          <p>Farmers Directory</p>
        </div>
        <nav className="sidebar-menu">
          {MENU.map(item => (
            <div key={item.key} className={`sidebar-menu-item ${item.key === "farmers" ? "active-menu" : ""}`} onClick={() => navigate(item.path)}>
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

      {/* Main Container */}
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
                placeholder="Search farmers..."
                value={farmerSearch}
                onChange={e => { setFarmerSearch(e.target.value); setCurrentPage(1); }}
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

        {/* ===================================================
                 SECTION 1: FARMERS DIRECTORY
        =================================================== */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Farmers Directory</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
              {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <select
              value={districtFilter}
              onChange={e => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#334155", background: "#fff", cursor: "pointer" }}
            >
              {districts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Farmers Table */}
          <div className="farmer-table-container">
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>Loading farmers...</div>
            ) : paginatedFarmers.length > 0 ? (
              <table className="farmer-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>District</th>
                    <th>State</th>
                    <th>Farms</th>
                    <th>Area (ac)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFarmers.map((f, i) => (
                    <tr key={f.userId} style={{ cursor: "pointer" }} onClick={() => openDrawer(f)}>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.phone || "-"}</td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <FaMapMarkerAlt style={{ color: "#16a34a", fontSize: 11 }} />
                          {f.district || "-"}
                        </span>
                      </td>
                      <td>{f.state || "-"}</td>
                      <td>{getFarmerFarmCount(f.userId)}</td>
                      <td>{getFarmerArea(f.userId)} ac</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openDrawer(f)}
                          style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #16a34a", background: "transparent", color: "#16a34a", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>
                No farmers registered yet.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: currentPage === 1 ? "#f1f5f9" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13 }}
              >← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: currentPage === i + 1 ? "#16a34a" : "#fff", color: currentPage === i + 1 ? "#fff" : "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: currentPage === totalPages ? "#f1f5f9" : "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13 }}
              >Next →</button>
            </div>
          )}
        </section>

        {/* ===================================================
                 SECTION 2: FARMS & CROPS OPERATIONS DESK
        =================================================== */}
        <section style={{ borderTop: "2px solid #cbd5e1", paddingTop: 30 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Farms & Crops Desk</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Monitor registered agricultural fields, soil types, and active cultivation crops.</p>
          </div>

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

          {/* Analytics Charts */}
          <section className="analytics-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 28 }}>
            {/* Crop Distribution Bar Chart */}
            <div className="chart-card">
              <div className="chart-header" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Crop Distribution</h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>Active crops by type</span>
              </div>
              {cropBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={cropBarData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="crop" tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {cropBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600 }}>
                  No crop data available yet
                </div>
              )}
            </div>

            {/* Soil Type Distribution Pie Chart */}
            <div className="chart-card">
              <div className="chart-header" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Soil Types</h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>Farm distribution</span>
              </div>
              {soilPieData.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={soilPieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={4}>
                        {soilPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    {soilPieData.map((d, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                          <span style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>{d.name}</span>
                        </div>
                        <strong style={{ fontSize: 12, color: "#0f172a" }}>{d.value} farm{d.value !== 1 ? "s" : ""}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600, textAlign: "center" }}>
                  No farm data yet
                </div>
              )}
            </div>
          </section>

          {/* Sub-Tab Bar & Search Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
              {[
                { key: "farms", label: `Farms (${farms.length})` },
                { key: "crops", label: `Crops (${crops.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSelectedFarm(null); setSelectedCrop(null); setFarmSearch(""); }}
                  style={{
                    padding: "8px 22px", borderRadius: 10, border: "none", fontWeight: 700,
                    fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                    background: activeTab === tab.key ? "#16a34a" : "transparent",
                    color: activeTab === tab.key ? "#fff" : "#64748b",
                  }}
                >{tab.label}</button>
              ))}
            </div>

            <div style={{ position: "relative", width: 280 }}>
              <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                type="text"
                placeholder={activeTab === "farms" ? "Search farms..." : "Search crops..."}
                value={farmSearch}
                onChange={e => setFarmSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, border: "1.5px solid #cbd5e1", outline: "none", fontSize: 13 }}
              />
            </div>
          </div>

          {/* Content: Two-column layout when item selected */}
          <div style={{ display: "grid", gridTemplateColumns: selectedFarm || selectedCrop ? "1fr 1fr" : "1fr", gap: 24 }}>
            {/* Left: Table */}
            <div className="farmer-table-container">
              {activeTab === "farms" ? (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <strong style={{ color: "#0f172a", fontSize: 13 }}>{filteredFarms.length} farms registered</strong>
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
                            <td>{getFarmerName(f.userId || f.farmerId)}</td>
                            <td>{f.area} ac</td>
                            <td>{f.soilType || "-"}</td>
                            <td>{f.waterSource || "-"}</td>
                            <td>
                              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                                <FaMapMarkerAlt style={{ color: "#16a34a", fontSize: 10 }} />
                                {f.location ? f.location.split(" | ")[0] : "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>No farms registered yet.</div>
                  )}
                </>
              ) : (
                /* Crops Table */
                <>
                  <div style={{ marginBottom: 14 }}>
                    <strong style={{ color: "#0f172a", fontSize: 13 }}>{filteredCrops.length} crops registered</strong>
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
                              <td>{getFarmerName(parentFarm?.userId || parentFarm?.farmerId)}</td>
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
                    <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>No crops registered yet.</div>
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
                        { label: "Owner",       value: getFarmerName(selectedFarm.userId || selectedFarm.farmerId) },
                        { label: "Total Area",  value: `${selectedFarm.area} acres` },
                        { label: "Soil Type",   value: selectedFarm.soilType || "-" },
                        { label: "Water Source",value: selectedFarm.waterSource || "-" },
                        { label: "Location",    value: selectedFarm.location ? selectedFarm.location.split(" | ")[0] : "-" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "#f8fafc", borderRadius: 9, border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Leaflet Visual Map Viewer */}
                    <div style={{ marginBottom: 20 }}>
                      <LeafletViewer farm={selectedFarm} />
                    </div>

                    {/* Registered crops */}
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                        Registered Crops ({getCropsForFarm(selectedFarm.farmId).length})
                      </h4>
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
                  const totalFarmArea = parentFarm ? parentFarm.area : 0;
                  const cropPlantedArea = selectedCrop.area ? selectedCrop.area : (Number(totalFarmArea) * 0.65).toFixed(2);

                  return (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                        {[
                          { label: "Farmer",          value: getFarmerName(parentFarm?.userId || parentFarm?.farmerId) },
                          { label: "Farm",            value: parentFarm?.farmName || "-" },
                          { label: "Planted Crop Area",value: `${cropPlantedArea} acres` },
                          { label: "Total Farm Area",  value: `${totalFarmArea} acres` },
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
                      {parentFarm && (
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 10 }}>Farm Location</h4>
                          <LeafletViewer farm={parentFarm} />
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
        </section>
      </div>

      {/* ── Farmer Detail Drawer ── */}
      {drawerOpen && selectedFarmer && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
            onClick={() => setDrawerOpen(false)}
          />
          <div style={{
            position: "fixed", top: 0, right: 0, height: "100vh", width: "min(480px,100vw)",
            background: "#fff", zIndex: 201, boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column", overflowY: "auto"
          }}>
            {/* Drawer Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src={`https://randomuser.me/api/portraits/${selectedFarmer.userId % 2 === 0 ? "men" : "women"}/${selectedFarmer.userId % 99}.jpg`}
                  alt={selectedFarmer.name}
                  style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "3px solid #dcfce7" }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{selectedFarmer.name}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{selectedFarmer.district}, {selectedFarmer.state}</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>
                <FaTimes />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 24px" }}>
              {[
                { key: "info",    label: "Info"      },
                { key: "farms",   label: `Farms (${farmerFarms.length})`  },
                { key: "crops",   label: `Crops (${farmerCrops.length})`  },
                { key: "docs",    label: `Docs (${farmerDocs.length})`    },
                { key: "schemes", label: `Schemes (${farmerApps.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setDrawerTab(tab.key)}
                  style={{
                    padding: "12px 14px", border: "none", background: "transparent", fontWeight: 700,
                    fontSize: 12, cursor: "pointer", color: drawerTab === tab.key ? "#16a34a" : "#64748b",
                    borderBottom: drawerTab === tab.key ? "2.5px solid #16a34a" : "2.5px solid transparent",
                    transition: "all 0.2s"
                  }}
                >{tab.label}</button>
              ))}
            </div>

            {/* Drawer Content */}
            <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
              {drawerLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading...</div>
              ) : (
                <>
                  {/* INFO TAB */}
                  {drawerTab === "info" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      
                      {/* Section 1: Personal */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#16a34a", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 4 }}>
                          1. Personal Information
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { label: "Full Name",         value: selectedFarmer.name },
                            { label: "Date of Birth",     value: selectedFarmer.dob || "-" },
                            { label: "Gender",            value: selectedFarmer.gender || "-" },
                            { label: "Mobile Number",     value: selectedFarmer.phone || "-" },
                            { label: "Email Address",     value: selectedFarmer.email },
                            { label: "Registration Date", value: selectedFarmer.createdAt ? new Date(selectedFarmer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-" },
                            { label: "Farmer ID",         value: `#${selectedFarmer.userId}` },
                          ].map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                              <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: Location */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#16a34a", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 4 }}>
                          2. Location Details
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { label: "State",               value: selectedFarmer.state || "-" },
                            { label: "District",            value: selectedFarmer.district || "-" },
                            { label: "Taluk / Block",       value: selectedFarmer.taluk || "-" },
                            { label: "Village / Panchayat",  value: selectedFarmer.village || "-" },
                            { label: "PIN Code",            value: selectedFarmer.pincode || "-" },
                          ].map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                              <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: Land / Farmer Info */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#16a34a", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 4 }}>
                          3. Land / Farmer Information
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { label: "Land Ownership Type",        value: selectedFarmer.landOwnershipType || "-" },
                            { label: "Total Landholding",          value: selectedFarmer.totalLandholding ? `${selectedFarmer.totalLandholding} acres` : "-" },
                            { label: "Farmer Category",            value: selectedFarmer.farmerCategory || "-" },
                            { label: "Ownership Document Available",value: selectedFarmer.ownershipDocumentAvailable != null ? (selectedFarmer.ownershipDocumentAvailable ? "Yes" : "No") : "-" },
                          ].map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                              <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 4: Financial */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#16a34a", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 4 }}>
                          4. Financial Information
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { label: "Annual Family Income Range",   value: selectedFarmer.annualIncomeRange || "-" },
                            { label: "Income Certificate Available",  value: selectedFarmer.incomeCertificateAvailable != null ? (selectedFarmer.incomeCertificateAvailable ? "Yes" : "No") : "-" },
                          ].map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                              <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 5: Farm Assets */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#16a34a", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 4 }}>
                          5. Farm Assets
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                          {[
                            { label: "Tractor",                value: selectedFarmer.hasTractor ? "✓ Yes" : "✗ No", active: selectedFarmer.hasTractor },
                            { label: "Agri Machinery",         value: selectedFarmer.hasMachinery ? "✓ Yes" : "✗ No", active: selectedFarmer.hasMachinery },
                            { label: "Irrigation Equipment",   value: selectedFarmer.hasIrrigationEquipment ? "✓ Yes" : "✗ No", active: selectedFarmer.hasIrrigationEquipment },
                            { label: "Pump Set",               value: selectedFarmer.hasPumpSet ? "✓ Yes" : "✗ No", active: selectedFarmer.hasPumpSet },
                            { label: "Storage Facility",       value: selectedFarmer.hasStorageFacility ? "✓ Yes" : "✗ No", active: selectedFarmer.hasStorageFacility },
                            { label: "Greenhouse / Polyhouse", value: selectedFarmer.hasGreenhouse ? "✓ Yes" : "✗ No", active: selectedFarmer.hasGreenhouse },
                          ].map((item, i) => (
                            <div key={i} style={{ padding: "8px 10px", background: item.active ? "#f0fdf4" : "#f8fafc", borderRadius: 8, border: item.active ? "1px solid #86efac" : "1px solid #e2e8f0" }}>
                              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{item.label}</div>
                              <strong style={{ fontSize: 12, color: item.active ? "#15803d" : "#64748b" }}>{item.value}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 6: Farming Background */}
                      <div>
                        <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: "#16a34a", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 4 }}>
                          6. Farming Background
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { label: "Type of Farming",                 value: selectedFarmer.farmingType || "-" },
                            { label: "Number of Years Farming",         value: selectedFarmer.yearsFarming ? `${selectedFarmer.yearsFarming} years` : "-" },
                            { label: "Group / Organization Membership", value: selectedFarmer.organizationMembership || "-" },
                          ].map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                              <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* FARMS TAB */}
                  {drawerTab === "farms" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {farmerFarms.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>No farms registered</div>
                      ) : farmerFarms.map(f => (
                        <div key={f.farmId} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <strong style={{ color: "#0f172a", fontSize: 14 }}>{f.farmName}</strong>
                            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>{f.area} ac</span>
                          </div>
                          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                            <span>🪨 {f.soilType || "-"}</span>
                            <span>💧 {f.waterSource || "-"}</span>
                            <span>📍 {f.location ? f.location.split(" | ")[0] : "-"}</span>
                          </div>
                          <LeafletViewer farm={f} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CROPS TAB */}
                  {drawerTab === "crops" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {farmerCrops.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>No crops registered</div>
                      ) : farmerCrops.map(c => {
                        const pf = farms.find(f => f.farmId === c.farmId);
                        const totalFarmArea = pf ? pf.area : 0;
                        const cropPlantedArea = c.area ? c.area : (Number(totalFarmArea) * 0.65).toFixed(2);
                        return (
                          <div key={c.cropId} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                              <strong style={{ color: "#0f172a", fontSize: 14 }}>{c.cropName}</strong>
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                                background: c.status === "ACTIVE" ? "#dcfce7" : c.status === "HARVESTED" ? "#dbeafe" : "#fee2e2",
                                color: c.status === "ACTIVE" ? "#15803d" : c.status === "HARVESTED" ? "#1d4ed8" : "#dc2626"
                              }}>{c.status}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748b" }}>
                              <div>🌾 Planted Area: {cropPlantedArea} ac (Total Farm: {totalFarmArea} ac)</div>
                              <div>🌱 Planted: {c.plantedDate || "-"}</div>
                              <div>🗓️ Harvest: {c.expectedHarvestDate || "-"}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* DOCS TAB */}
                  {drawerTab === "docs" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {farmerDocs.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>
                          <FaFileAlt style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }} /><br />
                          No documents uploaded yet
                        </div>
                      ) : farmerDocs.map(doc => {
                        const sc = STATUS_COLORS[doc.verificationStatus] || STATUS_COLORS.PENDING;
                        return (
                          <div key={doc.documentId} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <div>
                                <strong style={{ color: "#0f172a", fontSize: 13 }}>{doc.documentType}</strong>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>{doc.originalFilename}</p>
                                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : ""}
                                  {doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                                </p>
                              </div>
                              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                                {doc.verificationStatus}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleDownload(doc)}
                                style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                              ><FaDownload /> Download</button>
                              {doc.verificationStatus !== "VERIFIED" && (
                                <button
                                  onClick={() => handleVerifyDoc(doc.documentId, "VERIFIED")}
                                  style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "none", background: "#dcfce7", color: "#15803d", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                                ><FaCheckCircle /> Verify</button>
                              )}
                              {doc.verificationStatus !== "REJECTED" && (
                                <button
                                  onClick={() => handleVerifyDoc(doc.documentId, "REJECTED")}
                                  style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                                ><FaTimesCircle /> Reject</button>
                              )}
                            </div>
                            {doc.rejectionRemarks && (
                              <p style={{ marginTop: 8, fontSize: 12, color: "#dc2626", background: "#fff5f5", padding: "6px 10px", borderRadius: 8, border: "1px solid #fecdd3" }}>
                                ⚠️ Remarks: {doc.rejectionRemarks}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SCHEMES TAB */}
                  {drawerTab === "schemes" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {farmerApps.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>No scheme applications yet</div>
                      ) : farmerApps.map(app => (
                        <div key={app.application_id || app.applicationId} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <strong style={{ color: "#0f172a", fontSize: 13 }}>{app.scheme_name || app.schemeName}</strong>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: app.status === "APPROVED" ? "#dcfce7" : app.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                              color: app.status === "APPROVED" ? "#15803d" : app.status === "REJECTED" ? "#dc2626" : "#b45309"
                            }}>
                              {app.status === "APPLIED" ? "PENDING" : app.status}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                            Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-IN") : "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}