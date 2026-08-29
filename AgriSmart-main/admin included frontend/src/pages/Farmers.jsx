import React, { useState, useEffect, useCallback } from "react";
import "../styles/ofarmers.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaBars, FaHome, FaUsers, FaTractor, FaClipboardList, FaBell,
  FaSearch, FaUserCircle, FaSignOutAlt, FaEye, FaTimes,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaDownload,
  FaFileAlt, FaSeedling, FaMapMarkerAlt
} from "react-icons/fa";
import { MdAgriculture } from "react-icons/md";
import { setUser, setToken } from "../main";
import { documentApi, schemeApi, userApi, farmApi } from "../services/api";

const MENU = [
  { name: "Dashboard",     icon: <FaHome />,         path: "/officer/dashboard",   key: "dashboard" },
  { name: "Farmers",       icon: <FaUsers />,         path: "/officer/farmers",     key: "farmers"   },
  { name: "Farms & Crops", icon: <FaTractor />,       path: "/officer/ofarms",      key: "farms"     },
  { name: "Schemes",       icon: <FaClipboardList />, path: "/officer/oschemes",    key: "schemes"   },
  { name: "Broadcast",     icon: <FaBell />,          path: "/officer/onification", key: "notif"     },
  { name: "Profile",       icon: <FaUserCircle />,    path: "/officer/oprofile",    key: "profile"   },
];

const STATUS_COLORS = {
  VERIFIED: { bg: "#dcfce7", color: "#15803d" },
  PENDING:  { bg: "#fef3c7", color: "#b45309" },
  REJECTED: { bg: "#fee2e2", color: "#dc2626" },
};

export default function Farmers() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const user     = useSelector(s => s.agri.user);
  const token    = useSelector(s => s.agri.token);
  const farms    = useSelector(s => s.agri.farms)    || [];
  const crops    = useSelector(s => s.agri.crops)    || [];
  const reduxUsers = useSelector(s => s.agri.usersList) || [];

  const [showSidebar,      setShowSidebar]      = useState(false);
  const [searchTerm,       setSearchTerm]       = useState(searchParams.get("search") || "");
  const [districtFilter,   setDistrictFilter]   = useState("All");
  const [farmers,          setFarmers]          = useState([]);
  const [loading,          setLoading]          = useState(true);

  // Drawer state
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

  /* ── Fetch farmers ── */
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

    // Get farms and crops from Redux (already fetched)
    setFarmerFarms(farms.filter(f => f.userId === farmer.userId));
    setFarmerCrops(crops.filter(c => {
      const ff = farms.filter(f => f.userId === farmer.userId);
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

  /* ── Filtered + Paginated ── */
  const districts = ["All", ...new Set(farmers.map(f => f.district).filter(Boolean))];

  const filtered = farmers.filter(f => {
    const q = searchTerm.toLowerCase();
    const matchName  = (f.name || "").toLowerCase().includes(q);
    const matchPhone = (f.phone || "").includes(q);
    const matchDist  = (f.district || "").toLowerCase().includes(q);
    const matchDistrFilter = districtFilter === "All" || f.district === districtFilter;
    return (matchName || matchPhone || matchDist) && matchDistrFilter;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getFarmerFarmCount = (userId) => farms.filter(f => f.userId === userId).length;
  const getFarmerArea = (userId) => farms.filter(f => f.userId === userId).reduce((s, f) => s + (Number(f.area) || 0), 0).toFixed(1);

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
                placeholder="Search by name, phone, or district..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Farmers Directory</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{filtered.length} farmer{filtered.length !== 1 ? "s" : ""} found</p>
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

        {/* Table */}
        <div className="farmer-table-container">
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>Loading farmers...</div>
          ) : paginated.length > 0 ? (
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
                {paginated.map((f, i) => (
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
              No farmers found matching your search.
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
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { label: "Full Name",         value: selectedFarmer.name },
                        { label: "Email",             value: selectedFarmer.email },
                        { label: "Phone",             value: selectedFarmer.phone || "-" },
                        { label: "District",          value: selectedFarmer.district || "-" },
                        { label: "State",             value: selectedFarmer.state || "-" },
                        { label: "Registration Date", value: selectedFarmer.createdAt ? new Date(selectedFarmer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-" },
                        { label: "Farmer ID",         value: `#${selectedFarmer.userId}` },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
                        </div>
                      ))}
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
                          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b" }}>
                            <span>🪨 {f.soilType || "-"}</span>
                            <span>💧 {f.waterSource || "-"}</span>
                            <span>📍 {f.location || "-"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CROPS TAB */}
                  {drawerTab === "crops" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {farmerCrops.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>No crops registered</div>
                      ) : farmerCrops.map(c => (
                        <div key={c.cropId} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <strong style={{ color: "#0f172a", fontSize: 14 }}>{c.cropName}</strong>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                              background: c.status === "ACTIVE" ? "#dcfce7" : c.status === "HARVESTED" ? "#dbeafe" : "#fee2e2",
                              color: c.status === "ACTIVE" ? "#15803d" : c.status === "HARVESTED" ? "#1d4ed8" : "#dc2626"
                            }}>{c.status}</span>
                          </div>
                          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b" }}>
                            <span>🌱 Planted: {c.plantedDate || "-"}</span>
                            <span>🗓️ Harvest: {c.expectedHarvestDate || "-"}</span>
                          </div>
                        </div>
                      ))}
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