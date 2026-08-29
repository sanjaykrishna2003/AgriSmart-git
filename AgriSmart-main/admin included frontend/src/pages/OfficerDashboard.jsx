import React, { useState, useEffect } from "react";
import "../styles/officerdashboard.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  FaBars, FaHome, FaUsers, FaTractor, FaClipboardList,
  FaBell, FaSearch, FaUserCircle, FaLeaf, FaSignOutAlt,
  FaMapMarkerAlt, FaSeedling, FaFileAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf
} from "react-icons/fa";
import { MdAgriculture } from "react-icons/md";
import { WiDaySunny, WiHumidity, WiStrongWind, WiRain } from "react-icons/wi";
import {
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie, Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend
} from "recharts";
import { setUser, setToken } from "../main";
import { analyticsApi } from "../services/api";

const MENU = [
  { name: "Dashboard", icon: <FaHome />, path: "/officer/dashboard", key: "dashboard" },
  { name: "Farmers", icon: <FaUsers />, path: "/officer/farmers", key: "farmers" },
  { name: "Farms & Crops", icon: <FaTractor />, path: "/officer/ofarms", key: "farms" },
  { name: "Schemes", icon: <FaClipboardList />, path: "/officer/oschemes", key: "schemes" },
  { name: "Broadcast", icon: <FaBell />, path: "/officer/onification", key: "notif" },
  { name: "Profile", icon: <FaUserCircle />, path: "/officer/oprofile", key: "profile" },
];

const COLORS = ["#16a34a", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useSelector(s => s.agri.user);
  const token = useSelector(s => s.agri.token);
  const farms = useSelector(s => s.agri.farms) || [];
  const crops = useSelector(s => s.agri.crops) || [];
  const usersList = useSelector(s => s.agri.usersList) || [];
  const broadcasts = useSelector(s => s.agri.broadcastNotifications) || [];

  /* ── Fetch officer analytics from backend ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    analyticsApi.getOfficerAnalytics(token)
      .then(data => { setAnalytics(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [token]);

  /* ── Fetch live weather for officer's district ── */
  useEffect(() => {
    const districtCoords = {
      "Ambala": { lat: 30.378, lon: 76.776 },
      "Coimbatore": { lat: 11.016, lon: 76.955 },
      "Chandigarh": { lat: 30.732, lon: 76.779 },
      "Delhi": { lat: 28.613, lon: 77.209 },
      "Mumbai": { lat: 19.076, lon: 72.877 },
      "Hyderabad": { lat: 17.385, lon: 78.486 },
      "default": { lat: 28.613, lon: 77.209 },
    };
    const district = user?.district || "default";
    const coords = districtCoords[district] || districtCoords["default"];

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
      `&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m`
    )
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.current) return;
        const wmo = (c) => {
          if (c === 0) return "☀️ Sunny";
          if (c <= 3) return "⛅ Partly Cloudy";
          if (c <= 48) return "🌫️ Foggy";
          if (c <= 55) return "🌦️ Drizzle";
          if (c <= 65) return "🌧️ Rainy";
          if (c <= 75) return "❄️ Snowy";
          if (c <= 82) return "🌦️ Rain Showers";
          return "⛈️ Thunderstorm";
        };
        setWeather({
          location: user?.district || "District",
          temperature: d.current.temperature_2m,
          condition: wmo(d.current.weather_code),
          humidity: d.current.relative_humidity_2m,
          wind: d.current.wind_speed_10m,
          rain: d.current.rain,
        });
      })
      .catch(() => { });
  }, [user]);

  /* ── Derived data from analytics OR Redux fallback ── */
  const totalFarmers = analytics?.totalFarmers ?? usersList.filter(u => u.role === "FARMER").length;
  const totalFarms = analytics?.totalFarms ?? farms.length;
  const totalArea = analytics?.totalCultivatedArea ?? farms.reduce((s, f) => s + (Number(f.area) || 0), 0);
  const activeCrops = analytics?.activeCrops ?? crops.filter(c => c.status === "ACTIVE").length;
  const pendingDocs = analytics?.pendingDocuments ?? 0;
  const verifiedDocs = analytics?.verifiedDocuments ?? 0;
  const rejectedDocs = analytics?.rejectedDocuments ?? 0;

  const monthlyReg = analytics?.monthlyRegistrations || [];
  const cropDist = analytics?.cropDistribution || [];
  const soilDist = analytics?.soilDistribution || [];

  // Map crop distribution for bar chart
  const cropBarData = cropDist.map((d, i) => ({
    crop: d.name || d.crop_name || "",
    count: Number(d.value || d.count || 0),
    color: COLORS[i % COLORS.length]
  }));

  const soilPieData = soilDist.map(d => ({
    name: d.name || d.soil_type || "",
    value: Number(d.value || d.count || 0)
  }));

  const farmers = usersList.filter(u => u.role === "FARMER");
  const recentFarmers = [...farmers].slice(-5).reverse();

  /* ── Logout ── */
  const handleLogout = () => {
    dispatch(setUser(null));
    dispatch(setToken(null));
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  const handleSearch = (e) => {
    if ((e.key === "Enter" || e.type === "click") && searchTerm.trim()) {
      navigate(`/officer/farmers?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="officer-container">

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${showSidebar ? "show-overlay" : ""}`}
        onClick={() => setShowSidebar(false)}
      />

      {/* Sidebar */}
      <aside className={`officer-sidebar ${showSidebar ? "show-sidebar" : ""}`}>
        <div className="sidebar-header">
          <h2>AgriSmart</h2>
          <p>Officer Portal</p>
        </div>
        <nav className="sidebar-menu">
          {MENU.map((item) => (
            <div
              key={item.key}
              className={`sidebar-menu-item ${item.key === "dashboard" ? "active-menu" : ""}`}
              onClick={() => navigate(item.path)}
            >
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
              <FaSearch className="search-icon" style={{ cursor: "pointer" }} onClick={handleSearch} />
              <input
                className="search-input"
                type="text"
                placeholder="Search farmers, schemes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
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

        {/* Banner */}
        <section className="dashboard-banner" style={{ marginBottom: "32px" }}>
          <div className="banner-content">
            <h1>Welcome Back 👋</h1>
            <p>Monitor farmers, farms, crops and scheme activity across your region from one intelligent dashboard.</p>
            <button className="banner-button" onClick={() => navigate("/officer/oschemes")}>View Schemes</button>
          </div>
          <div className="banner-image">
            <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200" alt="banner" />
          </div>
        </section>

        {/* Stat Cards Row 1 */}
        <section className="stats-section" style={{ marginBottom: "24px" }}>
          {[
            { title: "Total Farmers", value: totalFarmers, icon: <FaUsers />, color: "#166534", bg: "#dcfce7", path: "/officer/farmers" },
            { title: "Total Farms", value: totalFarms, icon: <MdAgriculture />, color: "#15803d", bg: "#dbeafe", path: "/officer/ofarms" },
            { title: "Active Crops", value: activeCrops, icon: <FaLeaf />, color: "#f59e0b", bg: "#fef3c7", path: "/officer/ofarms" },
            { title: "Total Area", value: `${Number(totalArea).toFixed(1)}ac`, icon: <FaSeedling />, color: "#8b5cf6", bg: "#ede9fe", path: "/officer/ofarms" },
          ].map((s, i) => (
            <div key={i} className="stats-card" onClick={() => navigate(s.path)} style={{ cursor: "pointer" }}>
              <div className="stats-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stats-content">
                <h4>{s.title}</h4>
                <h2>{s.value}</h2>
              </div>
            </div>
          ))}
        </section>

        {/* Document Stats Row */}
        <section className="stats-section" style={{ marginBottom: "32px" }}>
          {[
            { title: "Pending Verifications", value: pendingDocs, icon: <FaHourglassHalf />, color: "#b45309", bg: "#fef3c7", path: "/officer/farmers" },
            { title: "Verified Documents", value: verifiedDocs, icon: <FaCheckCircle />, color: "#15803d", bg: "#dcfce7", path: "/officer/farmers" },
            { title: "Rejected Documents", value: rejectedDocs, icon: <FaTimesCircle />, color: "#dc2626", bg: "#fee2e2", path: "/officer/farmers" },
            { title: "Total Documents", value: pendingDocs + verifiedDocs + rejectedDocs, icon: <FaFileAlt />, color: "#2563eb", bg: "#dbeafe", path: "/officer/farmers" },
          ].map((s, i) => (
            <div key={i} className="stats-card" onClick={() => navigate(s.path)} style={{ cursor: "pointer" }}>
              <div className="stats-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stats-content">
                <h4>{s.title}</h4>
                <h2>{loading ? "..." : s.value}</h2>
              </div>
            </div>
          ))}
        </section>

        {/* Analytics Row 1: Crop Bar + Weather */}
        <section className="analytics-row" style={{ marginBottom: "32px" }}>

          {/* Crop Distribution Bar Chart */}
          <div className="chart-card" style={{ flex: 2 }}>
            <div className="chart-header">
              <h3>Crop Distribution</h3>
              <span>Active crops by type</span>
            </div>
            {cropBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cropBarData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="crop" tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {cropBarData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600 }}>
                {loading ? "Loading crop data..." : "No crop data available yet"}
              </div>
            )}
          </div>

          {/* Live Weather Card */}
          <div className="weather-card" style={{ flex: 1, minWidth: 240 }}>
            <div className="weather-header">
              <div>
                <h3 style={{ color: "#0f172a", fontSize: 16, fontWeight: 700 }}>Today's Weather</h3>
                <p style={{ color: "#475569", fontSize: 13, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <FaMapMarkerAlt style={{ color: "#16a34a" }} />&nbsp;{weather?.location || user?.district || "Loading..."}
                </p>
              </div>
              <WiDaySunny style={{ color: "#f59e0b", fontSize: 52 }} />
            </div>
            {weather ? (
              <>
                <h1 style={{ color: "#0f172a", fontSize: 48, fontWeight: 800, margin: "12px 0 4px" }}>{weather.temperature}°C</h1>
                <p style={{ color: "#475569", fontWeight: 600, marginBottom: 20, fontSize: 15 }}>{weather.condition}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { icon: <WiHumidity style={{ fontSize: 28, color: "#2563eb" }} />, label: "Humidity", val: `${weather.humidity}%` },
                    { icon: <WiStrongWind style={{ fontSize: 28, color: "#16a34a" }} />, label: "Wind", val: `${weather.wind} km/h` },
                    { icon: <WiRain style={{ fontSize: 28, color: "#8b5cf6" }} />, label: "Rain", val: `${weather.rain} mm` },
                  ].map((w, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      {w.icon}
                      <span style={{ display: "block", fontSize: 11, color: "#64748b", fontWeight: 600 }}>{w.label}</span>
                      <strong style={{ color: "#0f172a", fontSize: 13 }}>{w.val}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600 }}>
                Loading weather...
              </div>
            )}
          </div>
        </section>

        {/* Analytics Row 2: Soil Pie + Monthly Registrations + Recent Farmers */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "28px", marginBottom: "32px" }}>

          {/* Soil Type Distribution */}
          <div className="chart-card">
            <div className="chart-header" style={{ marginBottom: 16 }}>
              <h3>Soil Types</h3>
              <span>Farm distribution</span>
            </div>
            {soilPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={soilPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={4}>
                      {soilPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 12 }}>
                  {soilPieData.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{d.name}</span>
                      </div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{d.value} farm{d.value !== 1 ? "s" : ""}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600, textAlign: "center" }}>
                {loading ? "Loading..." : "No farm data yet"}
              </div>
            )}
          </div>

          {/* Monthly Registrations + Recent Farmers */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            <div className="chart-card">
              <div className="chart-header" style={{ marginBottom: 16 }}>
                <h3>Monthly Registrations</h3>
                <span>Farmer sign-ups per month</span>
              </div>
              {monthlyReg.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={monthlyReg}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                    <YAxis tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", color: "#fff", border: "none" }} />
                    <Line type="monotone" dataKey="farmers" stroke="#16a34a" strokeWidth={3} dot={{ fill: "#16a34a", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 600 }}>
                  {loading ? "Loading..." : "No registration data yet"}
                </div>
              )}
            </div>

            <div className="recent-users-card">
              <div className="recent-users-header" style={{ marginBottom: 16 }}>
                <h3 style={{ color: "#0f172a" }}>Recently Registered Farmers</h3>
              </div>
              <div className="recent-users-list">
                {recentFarmers.length > 0 ? recentFarmers.map((f, i) => (
                  <div key={i} className="recent-user-item" style={{ cursor: "pointer" }} onClick={() => navigate("/officer/farmers")}>
                    <img
                      src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? "men" : "women"}/${(f.userId || i + 1) % 99}.jpg`}
                      alt={f.name}
                      className="recent-user-image"
                    />
                    <div className="recent-user-info">
                      <h4 style={{ color: "#0f172a" }}>{f.name || "-"}</h4>
                      <p style={{ color: "#475569" }}>{f.district || f.state || "-"}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: "center", color: "#94a3b8", fontWeight: 600, padding: "20px 0" }}>
                    {loading ? "Loading farmers..." : "No farmers registered yet"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Broadcasts */}
        <section style={{ marginBottom: "32px" }}>
          <div className="chart-card">
            <div className="chart-header" style={{ marginBottom: 20 }}>
              <h3>Recent Broadcasts</h3>
              <button
                onClick={() => navigate("/officer/onification")}
                style={{ background: "linear-gradient(135deg,#15803d,#166534)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                View All
              </button>
            </div>
            {broadcasts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[...broadcasts].slice(0, 3).map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 16px", background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: n.priority === "High" ? "#fee2e2" : "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaBell style={{ color: n.priority === "High" ? "#dc2626" : "#16a34a", fontSize: 18 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: "#0f172a", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>{n.title}</h4>
                      <p style={{ color: "#475569", fontSize: 13, margin: "0 0 6px" }}>{n.message}</p>
                      <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>
                        {n.created_at ? new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Just now"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8", fontWeight: 600, padding: "30px 0" }}>
                No broadcasts yet.{" "}
                <span style={{ color: "#16a34a", cursor: "pointer" }} onClick={() => navigate("/officer/onification")}>Create one?</span>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}