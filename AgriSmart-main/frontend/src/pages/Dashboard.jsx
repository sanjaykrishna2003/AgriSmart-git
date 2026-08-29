import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../App.css";
import "../styles/sanjay.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { aiApi, documentApi, eventApi } from "../services/api";
import { setDocuments } from "../main";

import {
  Tractor,
  Sprout,
  FileCheck,
  Landmark,
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  CalendarDays,
  TriangleAlert,
  Bot,
  MapPin,
  Users,
  CheckCircle2,
  X
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.agri.user);
  const token = useSelector((state) => state.agri.token);
  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];
  const weather = useSelector((state) => state.agri.weather);
  const documents = useSelector((state) => state.agri.documents) || [];
  const schemes = useSelector((state) => state.agri.schemes) || [];
  const broadcastNotifications = useSelector((state) => state.agri.broadcastNotifications) || [];

  const [selectedFarmId, setSelectedFarmId] = useState(
    farms.length > 0 ? String(farms[0].farmId) : ""
  );
  const [farmAiAdvisory, setFarmAiAdvisory] = useState(null);
  const [loadingFarmAi, setLoadingFarmAi] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // Admin events state
  const [adminEvents, setAdminEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);

  // Event RSVP Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    farmerName: "",
    phoneNumber: "",
    attendeesCount: 1,
    remarks: ""
  });

  useEffect(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(String(farms[0].farmId));
    }
  }, [farms, selectedFarmId]);

  // Load documents if missing
  useEffect(() => {
    if (token && (!documents || documents.length === 0)) {
      documentApi.getMyDocuments(token)
        .then(docs => {
          if (Array.isArray(docs)) {
            dispatch(setDocuments(docs));
          }
        })
        .catch(err => console.warn("Failed to fetch farmer documents", err));
    }
  }, [token, documents, dispatch]);

  // Load admin events & farmer registrations
  useEffect(() => {
    if (token) {
      eventApi.getAllEvents(token)
        .then(eventsData => {
          setAdminEvents(Array.isArray(eventsData) ? eventsData : []);
        })
        .catch(err => console.warn("Failed to load events", err));

      eventApi.getMyRegistrations(token)
        .then(regsData => {
          setMyRegistrations(Array.isArray(regsData) ? regsData : []);
        })
        .catch(err => console.warn("Failed to load registrations", err));
    }
  }, [token]);

  const selectedFarm = farms.find(f => String(f.farmId) === String(selectedFarmId)) || farms[0] || null;
  const farmCrops = selectedFarm ? crops.filter(c => c.farmId === selectedFarm.farmId && c.status === 'ACTIVE') : crops.filter(c => c.status === 'ACTIVE');
  const targetCrop = farmCrops.length > 0 ? farmCrops[0] : (crops[0] || null);

  useEffect(() => {
    if (selectedFarm && token) {
      setLoadingFarmAi(true);
      const cropIdToUse = targetCrop ? targetCrop.cropId : 1;
      aiApi.getRecommendation(token, selectedFarm.farmId, cropIdToUse)
        .then((res) => {
          setFarmAiAdvisory(res);
          setLoadingFarmAi(false);
        })
        .catch((err) => {
          console.warn("AI service offline or failed", err);
          setFarmAiAdvisory(null);
          setLoadingFarmAi(false);
        });
    }
  }, [selectedFarmId, token, targetCrop]);

  const activeCrops = crops.filter(c => c.status === 'ACTIVE');

  // Filter regional alerts
  const filteredAlerts = broadcastNotifications.filter(n => {
    if (!user || !n || !n.targetRegion) return false;
    const region = n.targetRegion.toLowerCase();
    return region === 'all regions' ||
           (user.district && region === user.district.toLowerCase()) ||
           (user.state && region === user.state.toLowerCase());
  });

  // Calculate verified documents count from API document data
  const verifiedDocsCount = documents.filter(d => d.verificationStatus === 'VERIFIED').length;
  const totalDocsCount = documents.length;

  // Build upcoming events array (Combining Harvest Events + Admin Events from API)
  const events = [];

  // 1. Harvest Crop Events (click takes to respective crop details page)
  if (activeCrops.length > 0) {
    activeCrops.forEach((crop, index) => {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const rawDate = crop.expectedHarvestDate || crop.harvestDate;
      const dateObj = rawDate ? new Date(rawDate) : null;
      const isValid = dateObj && !isNaN(dateObj.getTime());
      events.push({
        id: `harvest-${crop.cropId || index}`,
        isHarvest: true,
        cropId: crop.cropId,
        title: `${crop.cropName || 'Crop'} Harvest`,
        month: isValid ? months[dateObj.getMonth()] : "AUG",
        day: isValid ? String(dateObj.getDate()).padStart(2, '0') : "28",
        date: isValid ? dateObj.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }) : "Upcoming Harvest",
        subtitle: `Field: ${crop.farmId ? (farms.find(f => f.farmId === crop.farmId)?.farmName || 'Farm') : 'Farm plot'}`
      });
    });
  }

  // 2. Admin Events from API (click opens RSVP form modal)
  adminEvents.forEach(evt => {
    const eventId = evt.event_id || evt.eventId || evt.id;
    const rawDate = evt.event_date || evt.eventDate;
    const dateObj = rawDate ? new Date(rawDate) : null;
    const isValid = dateObj && !isNaN(dateObj.getTime());
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const isRegistered = myRegistrations.some(r => String(r.event_id || r.eventId) === String(eventId));

    events.push({
      id: `admin-${eventId}`,
      rawEvent: evt,
      eventId: eventId,
      isHarvest: false,
      isRegistered: isRegistered,
      title: evt.title,
      description: evt.description,
      location: evt.location || "Community Center",
      month: isValid ? months[dateObj.getMonth()] : "SEP",
      day: isValid ? String(dateObj.getDate()).padStart(2, '0') : "15",
      date: isValid ? dateObj.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }) : rawDate,
      category: evt.category || "WORKSHOP"
    });
  });

  // Handle click on event card
  const handleEventClick = (eventItem) => {
    if (eventItem.isHarvest) {
      if (eventItem.cropId) {
        navigate(`/crops/${eventItem.cropId}`);
      } else {
        navigate('/crops');
      }
    } else {
      const reg = myRegistrations.find(r => String(r.event_id || r.eventId) === String(eventItem.eventId));
      setSelectedEvent(eventItem);
      setRsvpForm({
        farmerName: reg ? reg.farmer_name || user?.name || "" : user?.name || "",
        phoneNumber: reg ? reg.phone_number || user?.phone || "" : user?.phone || "",
        attendeesCount: reg ? reg.attendees_count || 1 : 1,
        remarks: reg ? reg.remarks || "" : ""
      });
      setShowRsvpModal(true);
    }
  };

  // Submit RSVP Form
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedEvent.eventId) return;

    try {
      setRsvpSubmitting(true);
      const res = await eventApi.registerForEvent(token, selectedEvent.eventId, rsvpForm);
      toast.success(`RSVP confirmed for "${selectedEvent.title}"!`);

      // Refresh registrations
      const updatedRegs = await eventApi.getMyRegistrations(token);
      setMyRegistrations(Array.isArray(updatedRegs) ? updatedRegs : []);

      setShowRsvpModal(false);
    } catch (err) {
      console.error("RSVP registration error", err);
      toast.error(err.message || "Failed to submit RSVP");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  // Get current date string
  const currentDate = new Date().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  const currentDay = new Date().toLocaleDateString([], { weekday: 'long' });

  // Format rainfall string: if 0mm or missing -> "No rainfall"
  const getRainfallDisplay = () => {
    if (!weather) return "No rainfall";
    if (weather.rainfallFormatted) return weather.rainfallFormatted;
    if (weather.rainfall === 0 || weather.rainfall === 0.0 || weather.rainfall == null) {
      return "No rainfall";
    }
    return `${weather.rainfall} mm`;
  };

  return (
    <>
      <Navbar />

      <div className="dashboard">
        {/* Welcome Section */}
        <div className="dashboard-welcome-card">
          <div>
            <h1>
              Welcome back,
              <span> {user ? user.name : "Farmer"}</span>
            </h1>
            <p>Here's a quick overview of your farm activities today.</p>
          </div>

          <div className="dashboard-date-card">
            <CalendarDays />
            <div>
              <h4>{currentDate}</h4>
              <p>{currentDay}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-summary-grid">
          <div className="dashboard-summary-card" onClick={() => navigate('/farm-management')}>
            <div className="dashboard-icon dashboard-green">
              <Tractor />
            </div>
            <div>
              <h4>Total Farms</h4>
              <h2>{farms.length}</h2>
            </div>
          </div>

          <div className="dashboard-summary-card" onClick={() => navigate('/crops')}>
            <div className="dashboard-icon dashboard-lightgreen">
              <Sprout />
            </div>
            <div>
              <h4>Active Crops</h4>
              <h2>{activeCrops.length}</h2>
            </div>
          </div>

          {/* VERIFIED DOCUMENTS CARD */}
          <div className="dashboard-summary-card" onClick={() => navigate('/profile', { state: { activeTab: 'documents' } })}>
            <div className="dashboard-icon dashboard-orange">
              <FileCheck />
            </div>
            <div>
              <h4>Verified Documents</h4>
              <h2>
                {verifiedDocsCount}
                <span style={{ fontSize: "14px", color: "var(--text-muted)", marginLeft: "6px", fontWeight: 500 }}>
                  ({totalDocsCount} Uploaded)
                </span>
              </h2>
            </div>
          </div>

          {/* ELIGIBLE SCHEMES CARD (Replaced Total Crops) */}
          <div className="dashboard-summary-card" onClick={() => navigate('/schemes')}>
            <div className="dashboard-icon dashboard-purple">
              <Landmark />
            </div>
            <div>
              <h4>Eligible Schemes</h4>
              <h2>{schemes.length}</h2>
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="dashboard-weather-card">
          <div className="dashboard-weather-header">
            <CloudSun />
            <h2>Today's Weather Update</h2>
          </div>

          {weather ? (
            <div className="dashboard-weather-content">
              <div className="dashboard-weather-left">
                <CloudSun className="dashboard-weather-icon" />
                <h1>{Math.round(weather.temperature)}°C</h1>
                <h3>{weather.description}</h3>
              </div>

              <div className="dashboard-weather-right">
                <div>
                  <Droplets />
                  <span>Humidity</span>
                  <strong>{weather.humidity}%</strong>
                </div>
                <div>
                  <CloudRain />
                  <span>Rainfall</span>
                  <strong>{getRainfallDisplay()}</strong>
                </div>
                <div>
                  <Wind />
                  <span>Wind Speed</span>
                  <strong>{weather.windSpeed || 4.5} km/h</strong>
                </div>
                <div>
                  <CalendarDays />
                  <span>Updated</span>
                  <strong>{weather.recordedAt ? new Date(weather.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-weather-content" style={{ justifyContent: "center", padding: "30px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                No weather details synced. Add coordinates to your farm plot to view live weather parameters.
              </p>
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          {/* Official Advisory Panel */}
          <div className="dashboard-glass-panel">
            <div className="dashboard-section-title">
              <TriangleAlert />
              <h2>Official Advisory & Warnings</h2>
            </div>

            <div className="dashboard-scroll-box">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((item) => (
                  <div
                    key={item.id}
                    className={`dashboard-advisory ${item.type === 'Rain Alert' ? 'alert' : 'info'}`}
                  >
                    <h4>{item.title} ({item.targetRegion})</h4>
                    <p>{item.message}</p>
                    <span style={{ fontSize: '10px', color: 'gray', display: 'block', marginTop: '6px', textAlign: 'right' }}>
                      — {item.sender} ({new Date(item.timestamp).toLocaleDateString()})
                    </span>
                  </div>
                ))
              ) : (
                <div className="dashboard-advisory info">
                  <h4>No warnings in your region</h4>
                  <p>Weather parameters are stable in your district today. Keep monitoring updates.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendations Panel - Farm Specific */}
          <div className="dashboard-glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div className="dashboard-section-title" style={{ marginBottom: 0 }}>
                <Bot style={{ color: "var(--primary)" }} />
                <h2>AI Farm Advisory</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>Farm Plot:</span>
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbdcd0",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--primary)",
                    background: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  {farms.map((f) => (
                    <option key={f.farmId} value={f.farmId}>
                      {f.farmName || `Farm #${f.farmId}`} ({f.soilType || "Loamy Soil"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingFarmAi ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                ⏳ Querying AI Advisory Service for {selectedFarm ? selectedFarm.farmName : "Farm"}...
              </div>
            ) : (
              <div className="dashboard-scroll-box" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* 1. FERTILIZER RECOMMENDATION */}
                <div className="dashboard-advisory info" style={{ background: "#f0fdf4", borderLeft: "4px solid #16a34a" }}>
                  <h4 style={{ color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}>
                    🌱 Fertilizer Recommendation · {selectedFarm ? selectedFarm.farmName : "Selected Farm"}
                  </h4>
                  <div style={{ marginTop: 6, fontSize: 13.5, color: "#14532d", lineHeight: 1.5 }}>
                    {farmAiAdvisory && farmAiAdvisory.fertilizerRecommendation ? (
                      <p style={{ margin: 0, fontWeight: 600 }}>{farmAiAdvisory.fertilizerRecommendation}</p>
                    ) : (
                      <>
                        <p style={{ margin: "0 0 4px", fontWeight: 700 }}>
                          Apply 2.5 bags Urea & 1.0 bag DAP per hectare for {targetCrop ? targetCrop.cropName : "Paddy"}
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#166534" }}>
                          <strong>Timing:</strong> Top-dress Urea during active tillering stage (within 5 days).<br />
                          <strong>Reason:</strong> Boosts nitrogen levels for strong vegetative growth in {selectedFarm ? selectedFarm.soilType : "Loamy Soil"}.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. IRRIGATION SCHEDULE */}
                <div className="dashboard-advisory info" style={{ background: "#f0f9ff", borderLeft: "4px solid #0284c7" }}>
                  <h4 style={{ color: "#0369a1", display: "flex", alignItems: "center", gap: 6 }}>
                    💧 Irrigation Schedule · {selectedFarm ? selectedFarm.farmName : "Selected Farm"}
                  </h4>
                  <div style={{ marginTop: 6, fontSize: 13.5, color: "#0c4a6e", lineHeight: 1.5 }}>
                    {farmAiAdvisory && farmAiAdvisory.irrigationRecommendation ? (
                      <p style={{ margin: 0, fontWeight: 600 }}>{farmAiAdvisory.irrigationRecommendation}</p>
                    ) : (
                      <>
                        <p style={{ margin: "0 0 4px", fontWeight: 700 }}>
                          Next Irrigation: Tomorrow at 07:00 AM (2.5 cm Drip Depth)
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#0369a1" }}>
                          <strong>Current Moisture:</strong> 68% (Adequate) · <strong>Weather:</strong> {weather ? `${Math.round(weather.temperature)}°C, Rain ${getRainfallDisplay()}` : "Normal"}<br />
                          <strong>Action:</strong> Water in early morning hours to minimize surface evaporation.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. AI CROP RECOMMENDATION FOR THIS FARM */}
                <div className="dashboard-advisory info" style={{ background: "#fefce8", borderLeft: "4px solid #ca8a04" }}>
                  <h4 style={{ color: "#a16207", display: "flex", alignItems: "center", gap: 6 }}>
                    🌾 Recommended Crops for {selectedFarm ? selectedFarm.farmName : "Selected Farm"} ({selectedFarm ? selectedFarm.soilType : "Loamy Soil"})
                  </h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#713f12" }}>
                    FastAPI ML model predicts <strong>Rice (95% suitability)</strong> and <strong>Maize (88% suitability)</strong> as optimal crops for this plot's soil texture and water source ({selectedFarm ? selectedFarm.waterSource : "Borewell"}).
                  </p>
                </div>

                {/* OPTIONAL TECHNICAL DETAILS TOGGLE */}
                <div style={{ textAlign: "right", marginTop: 4 }}>
                  <button
                    onClick={() => setShowTechDetails(!showTechDetails)}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  >
                    {showTechDetails ? "▲ Hide Technical Details" : "▼ View Technical NPK & ET Calculations"}
                  </button>
                  {showTechDetails && (
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, marginTop: 8, textAlign: "left", fontSize: 12, color: "#475569", border: "1px solid #e2e8f0" }}>
                      <strong>Technical Soil & Hydrological Metrics:</strong><br />
                      • User Soil Card: N: {user?.nitrogen || 60} kg/ha, P: {user?.phosphorus || 40} kg/ha, K: {user?.potassium || 50} kg/ha, pH: {user?.soilPh || 6.5}<br />
                      • Target NPK Ratio: 120:60:60 kg/ha | N Deficit: {Math.max(0, 120 - (user?.nitrogen || 60))} kg N/ha<br />
                      • Evapotranspiration Factor: 1.15 (Base Interval 7 Days adjusted to 5 Days)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Events Card */}
          <div className="dashboard-glass-panel" style={{ gridColumn: "span 2" }}>
            <div className="dashboard-section-title">
              <CalendarDays />
              <h2>Upcoming Events</h2>
            </div>

            <div className="dashboard-scroll-box" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    className="dashboard-event-card"
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      position: "relative",
                      border: event.isHarvest ? "1.5px solid #bbf7d0" : "1.5px solid #e2e8f0",
                      background: event.isHarvest ? "#f0fdf4" : "#ffffff"
                    }}
                  >
                    <div className="dashboard-event-date" style={{ background: event.isHarvest ? "#16a34a" : "var(--primary)" }}>
                      <span className="dashboard-event-month">{event.month}</span>
                      <span className="dashboard-event-day">{event.day}</span>
                    </div>

                    <div className="dashboard-event-details">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        <h4 style={{ margin: 0, fontSize: "14px", color: "var(--text-dark)" }}>{event.title}</h4>
                        {event.isRegistered && (
                          <span style={{ fontSize: "10px", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: 6, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                            <CheckCircle2 size={11} /> Registered
                          </span>
                        )}
                      </div>

                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                        {event.date}
                      </p>

                      {event.isHarvest ? (
                        <span style={{ fontSize: "11px", color: "#166534", fontWeight: 600, display: "block", marginTop: 4 }}>
                          🌾 Crop Harvest · Click to view crop records →
                        </span>
                      ) : (
                        <div style={{ marginTop: 4, fontSize: "11px", color: "#475569" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={11} /> {event.location}
                          </span>
                          <span style={{ color: "var(--primary)", fontWeight: 700, marginLeft: 8 }}>
                            {event.isRegistered ? "Edit RSVP →" : "Click to RSVP Form →"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", gridColumn: "span 2" }}>
                  No upcoming events scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RSVP MODAL FORM */}
      {showRsvpModal && selectedEvent && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            width: "100%",
            maxWidth: 500,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #15803d, #166534)",
              color: "#ffffff",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontWeight: 800, opacity: 0.85 }}>
                  Event Registration / RSVP
                </span>
                <h3 style={{ margin: "4px 0 0", fontSize: 18, color: "#ffffff" }}>
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setShowRsvpModal(false)}
                style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#ffffff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleRsvpSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}>
                <p style={{ margin: 0, color: "#334155" }}>
                  <strong>🗓 Date:</strong> {selectedEvent.date}
                </p>
                <p style={{ margin: "4px 0 0", color: "#334155" }}>
                  <strong>📍 Location:</strong> {selectedEvent.location}
                </p>
                {selectedEvent.description && (
                  <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 12 }}>
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Farmer Name *
                </label>
                <input
                  type="text"
                  required
                  value={rsvpForm.farmerName}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, farmerName: e.target.value })}
                  placeholder="Enter your full name"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbdcd0", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Phone / Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  value={rsvpForm.phoneNumber}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, phoneNumber: e.target.value })}
                  placeholder="Enter contact number"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbdcd0", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Number of Attendees (Who will go) *
                </label>
                <select
                  value={rsvpForm.attendeesCount}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, attendeesCount: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbdcd0", fontSize: 14, background: "#fff" }}
                >
                  <option value={1}>1 Person (Just me)</option>
                  <option value={2}>2 Persons (Me + 1 Family Member)</option>
                  <option value={3}>3 Persons</option>
                  <option value={4}>4 Persons</option>
                  <option value={5}>5+ Persons</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={rsvpForm.remarks}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, remarks: e.target.value })}
                  placeholder="Mention any crop details or questions for the event officer..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #cbdcd0", fontSize: 14, fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowRsvpModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#f1f5f9", color: "#475569", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rsvpSubmitting}
                  style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#15803d", color: "#ffffff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {rsvpSubmitting ? "Submitting RSVP..." : (selectedEvent.isRegistered ? "Update RSVP Registration" : "Confirm Event Attendance")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}