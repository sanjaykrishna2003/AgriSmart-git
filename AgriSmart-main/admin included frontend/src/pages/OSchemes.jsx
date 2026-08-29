import React, { useState, useEffect, useCallback } from "react";
import "../styles/oschemes.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaBars, FaHome, FaUsers, FaTractor, FaClipboardList, FaBell,
  FaSearch, FaUserCircle, FaSignOutAlt, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaExternalLinkAlt, FaFileAlt, FaTimes, FaDownload
} from "react-icons/fa";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { setUser, setToken } from "../main";
import { schemeApi, documentApi } from "../services/api";

const MENU = [
  { name: "Dashboard",     icon: <FaHome />,         path: "/officer/dashboard",   key: "dashboard" },
  { name: "Farmers",       icon: <FaUsers />,         path: "/officer/farmers",     key: "farmers"   },
  { name: "Farms & Crops", icon: <FaTractor />,       path: "/officer/ofarms",      key: "farms"     },
  { name: "Schemes",       icon: <FaClipboardList />, path: "/officer/oschemes",    key: "schemes"   },
  { name: "Broadcast",     icon: <FaBell />,          path: "/officer/onification", key: "notif"     },
  { name: "Profile",       icon: <FaUserCircle />,    path: "/officer/oprofile",    key: "profile"   },
];

const STATUS_COLORS = { APPROVED: "#16a34a", REJECTED: "#ef4444", APPLIED: "#f59e0b", PENDING: "#f59e0b" };
const PIE_COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function OSchemes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user  = useSelector(s => s.agri.user);
  const token = useSelector(s => s.agri.token);

  const [showSidebar,   setShowSidebar]   = useState(false);
  const [schemes,       setSchemes]       = useState([]);
  const [applications,  setApplications]  = useState([]);
  const [selectedIdx,   setSelectedIdx]   = useState(0);
  const [filterStatus,  setFilterStatus]  = useState("ALL");
  const [searchScheme,  setSearchScheme]  = useState("");
  const [loading,       setLoading]       = useState(true);

  // Farmer docs modal
  const [docsModal,     setDocsModal]     = useState(null); // { userId, farmerName }
  const [farmerDocs,    setFarmerDocs]    = useState([]);
  const [docsLoading,   setDocsLoading]   = useState(false);

  /* ── Fetch schemes & all applications ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      schemeApi.getAllSchemes(token).catch(() => []),
      schemeApi.getAllApplications(token).catch(() => []),
    ]).then(([s, apps]) => {
      setSchemes(Array.isArray(s) ? s : []);
      setApplications(Array.isArray(apps) ? apps : []);
      setLoading(false);
    });
  }, [token]);

  /* ── Open docs modal for a farmer ── */
  const openDocsModal = useCallback(async (userId, farmerName) => {
    setDocsModal({ userId, farmerName });
    setDocsLoading(true);
    try {
      const docs = await documentApi.getUserDocuments(token, userId);
      setFarmerDocs(Array.isArray(docs) ? docs : []);
    } catch {
      setFarmerDocs([]);
    }
    setDocsLoading(false);
  }, [token]);

  /* ── Handle document verify/reject from modal ── */
  const handleVerifyDoc = async (docId, status) => {
    try {
      const updated = await documentApi.verify(token, docId, status);
      setFarmerDocs(prev => prev.map(d => d.documentId === docId ? updated : d));
      toast.success(`Document ${status === "VERIFIED" ? "verified" : "rejected"}.`);
    } catch {
      toast.error("Failed to update document.");
    }
  };

  /* ── Update application status ── */
  const handleStatus = async (appId, newStatus) => {
    try {
      await schemeApi.updateApplicationStatus(token, appId, newStatus);
      toast.success(`Application ${newStatus.toLowerCase()} successfully!`);
      setApplications(prev =>
        prev.map(a => (a.application_id || a.applicationId) === appId ? { ...a, status: newStatus } : a)
      );
    } catch {
      toast.error("Failed to update status.");
    }
  };

  /* ── Logout ── */
  const handleLogout = () => {
    dispatch(setUser(null));
    dispatch(setToken(null));
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  /* ── Derived data ── */
  const filteredSchemes = schemes.filter(s =>
    ((s.scheme_name || s.schemeName || "").toLowerCase().includes(searchScheme.toLowerCase())) ||
    ((s.category || "").toLowerCase().includes(searchScheme.toLowerCase()))
  );
  const currentScheme = filteredSchemes[selectedIdx] || filteredSchemes[0];
  const currentSchemeId = currentScheme?.scheme_id || currentScheme?.schemeId;

  const schemeApps = currentScheme
    ? applications.filter(a => (a.scheme_id || a.schemeId) === currentSchemeId)
    : [];

  const visibleApps = filterStatus === "ALL"
    ? schemeApps
    : schemeApps.filter(a => a.status === filterStatus || (filterStatus === "APPLIED" && a.status === "PENDING"));

  const totalApps     = applications.length;
  const totalApproved = applications.filter(a => a.status === "APPROVED").length;
  const totalRejected = applications.filter(a => a.status === "REJECTED").length;
  const totalPending  = applications.filter(a => a.status === "APPLIED" || a.status === "PENDING").length;

  const statusPieData = [
    { name: "Approved", value: totalApproved },
    { name: "Pending",  value: totalPending  },
    { name: "Rejected", value: totalRejected },
  ].filter(d => d.value > 0);

  const schemeBarData = schemes.map(s => ({
    name:  (s.scheme_name || s.schemeName || "").split(" ")[0],
    count: applications.filter(a => (a.scheme_id || a.schemeId) === (s.scheme_id || s.schemeId)).length,
  })).filter(d => d.count > 0);

  return (
    <div className="officer-container">

      {/* Overlay */}
      <div className={`sidebar-overlay ${showSidebar ? "show-overlay" : ""}`} onClick={() => setShowSidebar(false)} />

      {/* Sidebar */}
      <aside className={`officer-sidebar ${showSidebar ? "show-sidebar" : ""}`}>
        <div className="sidebar-header">
          <h2>AgriSmart</h2>
          <p>Scheme Administration</p>
        </div>
        <nav className="sidebar-menu">
          {MENU.map(item => (
            <div key={item.key} className={`sidebar-menu-item ${item.key === "schemes" ? "active-menu" : ""}`} onClick={() => navigate(item.path)}>
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
                placeholder="Search schemes by name or category..."
                value={searchScheme}
                onChange={e => { setSearchScheme(e.target.value); setSelectedIdx(0); }}
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

        {/* Stats */}
        <section className="stats-section" style={{ marginBottom: "32px" }}>
          {[
            { title: "Total Schemes",      value: schemes.length, icon: <FaClipboardList />, color: "#2563eb", bg: "#dbeafe" },
            { title: "Total Applications", value: totalApps,      icon: <FaUsers />,          color: "#22c55e", bg: "#dcfce7" },
            { title: "Approved",           value: totalApproved,  icon: <FaCheckCircle />,    color: "#16a34a", bg: "#dcfce7" },
            { title: "Pending Review",     value: totalPending,   icon: <FaHourglassHalf />,  color: "#f59e0b", bg: "#fef3c7" },
            { title: "Rejected",           value: totalRejected,  icon: <FaTimesCircle />,    color: "#ef4444", bg: "#fee2e2" },
          ].map((s, i) => (
            <div key={i} className="stats-card">
              <div className="stats-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stats-content"><h4>{s.title}</h4><h2>{loading ? "..." : s.value}</h2></div>
            </div>
          ))}
        </section>

        {/* Main Scheme Layout */}
        <section className="scheme-management" style={{ marginBottom: "32px" }}>

          {/* Left: Scheme List */}
          <div className="scheme-list-card">
            <div className="section-title" style={{ marginBottom: 16 }}>
              <h2>Government Schemes</h2>
              <span style={{ color: "#64748b", fontSize: 13 }}>{filteredSchemes.length} schemes</span>
            </div>
            <div className="scheme-scroll">
              {loading ? (
                <div style={{ padding: 20, color: "#94a3b8", textAlign: "center", fontWeight: 600 }}>Loading schemes...</div>
              ) : filteredSchemes.map((scheme, index) => {
                const sid = scheme.scheme_id || scheme.schemeId;
                const appCount = applications.filter(a => (a.scheme_id || a.schemeId) === sid).length;
                const pendingCount = applications.filter(a => (a.scheme_id || a.schemeId) === sid && (a.status === "APPLIED" || a.status === "PENDING")).length;
                return (
                  <div
                    key={sid}
                    className={`scheme-item ${selectedIdx === index ? "active-scheme" : ""}`}
                    onClick={() => { setSelectedIdx(index); setFilterStatus("ALL"); }}
                  >
                    <h3>{scheme.scheme_name || scheme.schemeName}</h3>
                    <p>{scheme.category}</p>
                    <div className="scheme-footer">
                      <span>Applications: {appCount}</span>
                      {pendingCount > 0 && (
                        <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {pendingCount} pending
                        </span>
                      )}
                      <span style={{ fontSize: 11 }}>{scheme.state}</span>
                    </div>
                  </div>
                );
              })}
              {!loading && filteredSchemes.length === 0 && (
                <div style={{ padding: 20, color: "#94a3b8", textAlign: "center", fontWeight: 600 }}>No schemes match your search</div>
              )}
            </div>
          </div>

          {/* Right: Scheme Details + Applications */}
          {currentScheme && (
            <div className="scheme-details-card">
              <div className="details-header">
                <div>
                  <h2>{currentScheme.scheme_name || currentScheme.schemeName}</h2>
                  <span style={{ display: "inline-block", marginTop: 6, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                    {currentScheme.category}
                  </span>
                </div>
                <a
                  href={currentScheme.official_link || currentScheme.officialLink}
                  target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 6, color: "#2563eb", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: 10, background: "#eff6ff" }}
                >
                  <FaExternalLinkAlt /> Official Portal
                </a>
              </div>

              <p className="scheme-description" style={{ margin: "16px 0" }}>{currentScheme.description}</p>

              <div className="details-grid">
                <div><label>Eligibility</label><h4>{currentScheme.eligibility_criteria || currentScheme.eligibilityCriteria}</h4></div>
                <div><label>Benefits</label><h4>{currentScheme.benefits}</h4></div>
                <div><label>Total Applied</label><h4>{schemeApps.length}</h4></div>
                <div><label>Approved</label><h4 style={{ color: "#16a34a" }}>{schemeApps.filter(a => a.status === "APPROVED").length}</h4></div>
                <div><label>Pending</label><h4 style={{ color: "#f59e0b" }}>{schemeApps.filter(a => a.status === "APPLIED" || a.status === "PENDING").length}</h4></div>
                <div><label>Rejected</label><h4 style={{ color: "#ef4444" }}>{schemeApps.filter(a => a.status === "REJECTED").length}</h4></div>
              </div>

              {/* Application Filter Tabs */}
              <div className="application-buttons" style={{ marginTop: 24, marginBottom: 16 }}>
                {["ALL", "APPLIED", "APPROVED", "REJECTED"].map(s => (
                  <button
                    key={s}
                    className={`filter-btn ${filterStatus === s ? "active-filter" : ""}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s === "ALL" ? "All" : s === "APPLIED" ? "Pending" : s.charAt(0) + s.slice(1).toLowerCase()}
                    {" "}({s === "ALL" ? schemeApps.length : schemeApps.filter(a => a.status === s || (s === "APPLIED" && a.status === "PENDING")).length})
                  </button>
                ))}
              </div>

              {/* Applications Table */}
              <div className="farmer-table-container">
                {loading ? (
                  <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8", fontWeight: 600 }}>Loading applications...</div>
                ) : visibleApps.length > 0 ? (
                  <table className="farmer-table">
                    <thead>
                      <tr>
                        <th>Farmer Name</th>
                        <th>District</th>
                        <th>Applied On</th>
                        <th>Status</th>
                        <th>Documents</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleApps.map((app, i) => {
                        const appId = app.application_id || app.applicationId;
                        const isPending = app.status === "APPLIED" || app.status === "PENDING";
                        const userId = app.user_id || app.userId;
                        const farmerName = app.user_name || app.userName || `Farmer #${userId}`;
                        return (
                          <tr key={i}>
                            <td><strong>{farmerName}</strong></td>
                            <td>{app.district || app.state || "-"}</td>
                            <td style={{ fontSize: 12, color: "#64748b" }}>
                              {app.applied_at || app.appliedAt
                                ? new Date(app.applied_at || app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : "-"}
                            </td>
                            <td>
                              <span style={{
                                padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                background: app.status === "APPROVED" ? "#dcfce7" : app.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                                color: STATUS_COLORS[app.status] || "#64748b"
                              }}>
                                {app.status === "APPLIED" ? "Pending" : app.status}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => openDocsModal(userId, farmerName)}
                                style={{ padding: "4px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#334155", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                              >
                                <FaFileAlt /> View
                              </button>
                            </td>
                            <td>
                              {isPending && appId ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    onClick={() => handleStatus(appId, "APPROVED")}
                                    style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "#dcfce7", color: "#15803d", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                                  >Approve</button>
                                  <button
                                    onClick={() => handleStatus(appId, "REJECTED")}
                                    style={{ padding: "4px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                                  >Reject</button>
                                </div>
                              ) : (
                                <span style={{ color: "#94a3b8", fontSize: 12 }}>
                                  {app.status === "APPROVED" ? "✓ Approved" : app.status === "REJECTED" ? "✗ Rejected" : "-"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontWeight: 600 }}>
                    {schemeApps.length === 0 ? "No applications for this scheme yet." : "No applications with this status."}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Analytics Charts */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", marginBottom: "32px" }}>

          <div className="chart-card">
            <div className="chart-header" style={{ marginBottom: 16 }}><h3>Application Status Overview</h3></div>
            {statusPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                      <Cell fill="#16a34a" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {statusPieData.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: ["#16a34a", "#f59e0b", "#ef4444"][i] }} />
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{d.name}</span>
                      </div>
                      <strong style={{ color: "#0f172a", fontSize: 13 }}>{d.value}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600, textAlign: "center" }}>
                No application data yet.<br />Charts appear when farmers apply.
              </div>
            )}
          </div>

          <div className="chart-card">
            <div className="chart-header" style={{ marginBottom: 16 }}>
              <h3>Applications per Scheme</h3>
              <span>Only schemes with applications shown</span>
            </div>
            {schemeBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={schemeBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                  <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600, textAlign: "center" }}>
                No applications yet.<br />Charts appear when farmers apply.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Farmer Documents Modal ── */}
      {docsModal && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300 }} onClick={() => setDocsModal(null)} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "min(520px,95vw)", maxHeight: "80vh", background: "#fff",
            borderRadius: 20, zIndex: 301, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Uploaded Documents</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{docsModal.farmerName}</p>
              </div>
              <button onClick={() => setDocsModal(null)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}><FaTimes /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
              {docsLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading documents...</div>
              ) : farmerDocs.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                  <FaFileAlt style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }} /><br />
                  No documents uploaded yet
                </div>
              ) : farmerDocs.map(doc => (
                <div key={doc.documentId} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{doc.documentType}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>{doc.originalFilename}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : ""}
                        {doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                      </p>
                    </div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: doc.verificationStatus === "VERIFIED" ? "#dcfce7" : doc.verificationStatus === "REJECTED" ? "#fee2e2" : "#fef3c7",
                      color: doc.verificationStatus === "VERIFIED" ? "#15803d" : doc.verificationStatus === "REJECTED" ? "#dc2626" : "#b45309"
                    }}>
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={async () => { try { await documentApi.download(token, doc.documentId, doc.originalFilename); } catch { toast.error("Download failed"); } }}
                      style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                    ><FaDownload /> Download</button>
                    {doc.verificationStatus !== "VERIFIED" && (
                      <button
                        onClick={() => handleVerifyDoc(doc.documentId, "VERIFIED")}
                        style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "none", background: "#dcfce7", color: "#15803d", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                      >✓ Verify</button>
                    )}
                    {doc.verificationStatus !== "REJECTED" && (
                      <button
                        onClick={() => handleVerifyDoc(doc.documentId, "REJECTED")}
                        style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                      >✗ Reject</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}