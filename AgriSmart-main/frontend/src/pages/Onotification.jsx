import React, { useState, useEffect } from "react";
import "../styles/onotification.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaBars, FaHome, FaUsers, FaTractor, FaClipboardList, FaBell,
  FaSearch, FaUserCircle, FaSignOutAlt, FaPaperPlane, FaTrash,
  FaBullhorn, FaExclamationTriangle, FaCheckCircle, FaFilter
} from "react-icons/fa";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";
import { setUser, setToken } from "../main";
import { notificationApi } from "../services/api";

const MENU = [
  { name: "Dashboard",     icon: <FaHome />,         path: "/officer/dashboard",   key: "dashboard" },
  { name: "Farmers",       icon: <FaUsers />,         path: "/officer/farmers",     key: "farmers"   },
  { name: "Schemes",       icon: <FaClipboardList />, path: "/officer/oschemes",    key: "schemes"   },
  { name: "Broadcast",     icon: <FaBell />,          path: "/officer/onification", key: "notif"     },
  { name: "Profile",       icon: <FaUserCircle />,    path: "/officer/oprofile",    key: "profile"   },
];

const PRIORITY_OPTS  = ["High", "Normal", "Low"];
const TYPE_OPTS      = ["Weather Alert", "Pest/Disease", "Government Scheme", "Market Price", "General Update", "Emergency"];
const TARGET_OPTS    = ["All Farmers", "Tamil Nadu", "Karnataka", "Maharashtra", "Punjab", "Haryana", "Telangana", "All States"];
const PIE_COLORS     = ["#ef4444", "#16a34a", "#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4"];

export default function ONotification() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user   = useSelector(s => s.agri.user);
  const token  = useSelector(s => s.agri.token);

  const [showSidebar,     setShowSidebar]     = useState(false);
  const [notifications,   setNotifications]   = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [sending,         setSending]         = useState(false);
  const [filterPriority,  setFilterPriority]  = useState("ALL");
  const [searchQuery,     setSearchQuery]     = useState("");

  // Form state
  const [title,       setTitle]       = useState("");
  const [message,     setMessage]     = useState("");
  const [type,        setType]        = useState("Weather Alert");
  const [priority,    setPriority]    = useState("High");
  const [targetRegion, setTargetRegion] = useState("All Farmers");

  /* ── Fetch notifications ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    notificationApi.getAllNotifications(token)
      .then(data => { setNotifications(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [token]);

  /* ── Send notification ── */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.warning("Title and message are required.");
      return;
    }
    setSending(true);
    try {
      const created = await notificationApi.createNotification(token, {
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
        targetRegion,
      });
      setNotifications(prev => [created, ...prev]);
      setTitle(""); setMessage("");
      setType("Weather Alert"); setPriority("High"); setTargetRegion("All Farmers");
      toast.success("Broadcast sent successfully!");
    } catch (err) {
      toast.error("Failed to send broadcast: " + err.message);
    }
    setSending(false);
  };

  /* ── Delete notification ── */
  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(token, id);
      setNotifications(prev => prev.filter(n => (n.notification_id || n.notificationId) !== id));
      toast.success("Broadcast deleted.");
    } catch {
      toast.error("Failed to delete broadcast.");
    }
  };

  const handleLogout = () => {
    dispatch(setUser(null));
    dispatch(setToken(null));
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  /* ── Derived stats ── */
  const highCount   = notifications.filter(n => n.priority === "High").length;
  const normalCount = notifications.filter(n => n.priority === "Normal").length;
  const lowCount    = notifications.filter(n => n.priority === "Low").length;

  const typePie = TYPE_OPTS.map(t => ({
    name: t,
    value: notifications.filter(n => n.type === t).length
  })).filter(d => d.value > 0);

  const filtered = notifications.filter(n => {
    const matchPriority = filterPriority === "ALL" || n.priority === filterPriority;
    const q = searchQuery.toLowerCase();
    const matchSearch = (n.title || "").toLowerCase().includes(q) || (n.message || "").toLowerCase().includes(q);
    return matchPriority && matchSearch;
  });

  const PRIORITY_STYLE = {
    High:   { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
    Normal: { bg: "#dcfce7", color: "#15803d", dot: "#16a34a" },
    Low:    { bg: "#fef3c7", color: "#b45309", dot: "#f59e0b" },
  };

  return (
    <div className="officer-container">

      {/* Overlay */}
      <div className={`sidebar-overlay ${showSidebar ? "show-overlay" : ""}`} onClick={() => setShowSidebar(false)} />

      {/* Sidebar */}
      <aside className={`officer-sidebar ${showSidebar ? "show-sidebar" : ""}`}>
        <div className="sidebar-header">
          <h2>AgriSmart</h2>
          <p>Broadcast Center</p>
        </div>
        <nav className="sidebar-menu">
          {MENU.map(item => (
            <div key={item.key} className={`sidebar-menu-item ${item.key === "notif" ? "active-menu" : ""}`} onClick={() => navigate(item.path)}>
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
                placeholder="Search broadcasts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="navbar-right">
            <button className="notification-btn"><FaBell /></button>
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
        <section className="stats-section" style={{ marginBottom: 28 }}>
          {[
            { title: "Total Broadcasts", value: notifications.length, icon: <FaBullhorn />,           color: "#2563eb", bg: "#dbeafe" },
            { title: "High Priority",    value: highCount,            icon: <FaExclamationTriangle />, color: "#dc2626", bg: "#fee2e2" },
            { title: "Normal Priority",  value: normalCount,          icon: <FaCheckCircle />,         color: "#16a34a", bg: "#dcfce7" },
            { title: "Low Priority",     value: lowCount,             icon: <FaBell />,                color: "#f59e0b", bg: "#fef3c7" },
          ].map((s, i) => (
            <div key={i} className="stats-card">
              <div className="stats-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stats-content"><h4>{s.title}</h4><h2>{s.value}</h2></div>
            </div>
          ))}
        </section>

        {/* Two-column layout */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 28, marginBottom: 28 }}>

          {/* Compose Form */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 20px" }}>
              <FaPaperPlane style={{ marginRight: 8, color: "#16a34a" }} />
              Compose Broadcast
            </h3>
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Heavy Rain Warning for Tamil Nadu"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Message *</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write your broadcast message here..."
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", cursor: "pointer" }}
                  >
                    {TYPE_OPTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", cursor: "pointer" }}
                  >
                    {PRIORITY_OPTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Target Region</label>
                <select
                  value={targetRegion}
                  onChange={e => setTargetRegion(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff", cursor: "pointer" }}
                >
                  {TARGET_OPTS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{
                  padding: "12px", borderRadius: 12, border: "none",
                  background: sending ? "#94a3b8" : "linear-gradient(135deg,#16a34a,#15803d)",
                  color: "#fff", fontWeight: 800, fontSize: 14, cursor: sending ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s", marginTop: 4
                }}
              >
                <FaPaperPlane /> {sending ? "Sending..." : "Send Broadcast"}
              </button>
            </form>
          </div>

          {/* Broadcast History */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Broadcast History</h3>
              <div style={{ display: "flex", gap: 6 }}>
                {["ALL", "High", "Normal", "Low"].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    style={{
                      padding: "5px 12px", borderRadius: 20, border: "1.5px solid #e2e8f0",
                      background: filterPriority === p ? "#16a34a" : "#fff",
                      color: filterPriority === p ? "#fff" : "#64748b",
                      fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.15s"
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, maxHeight: "65vh" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>Loading broadcasts...</div>
              ) : filtered.length > 0 ? (
                filtered.map(n => {
                  const id = n.notification_id || n.notificationId;
                  const ps = PRIORITY_STYLE[n.priority] || PRIORITY_STYLE.Normal;
                  return (
                    <div key={id} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: ps.dot, flexShrink: 0, marginTop: 5 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <strong style={{ fontSize: 13, color: "#0f172a", fontWeight: 800 }}>{n.title}</strong>
                          <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: ps.bg, color: ps.color, flexShrink: 0 }}>
                            {n.priority}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 8px", lineHeight: 1.5 }}>{n.message}</p>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{n.type}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>→ {n.target_region || n.targetRegion}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                            {n.created_at ? new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                          </span>
                          <button
                            onClick={() => handleDelete(id)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, padding: "2px 4px" }}
                            title="Delete"
                          ><FaTrash /></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontWeight: 600 }}>
                  {notifications.length === 0 ? "No broadcasts yet. Compose your first one!" : "No broadcasts match your filter."}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Type Breakdown Pie */}
        {typePie.length > 0 && (
          <div className="chart-card" style={{ marginBottom: 32 }}>
            <div className="chart-header" style={{ marginBottom: 16 }}><h3>Broadcast Type Breakdown</h3></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typePie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                    {typePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {typePie.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{d.name}</span>
                    </div>
                    <strong style={{ fontSize: 13, color: "#0f172a" }}>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}