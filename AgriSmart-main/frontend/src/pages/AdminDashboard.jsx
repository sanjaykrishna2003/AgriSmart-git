import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userApi, schemeApi, eventApi } from "../services/api";
import { setSchemes } from "../main";
import {
  FaUsers,
  FaTractor,
  FaSeedling,
  FaUserClock,
  FaCheckCircle,
  FaFileAlt,
  FaSpinner,
  FaCheck,
  FaCalendarAlt,
  FaPlus,
  FaTrash,
  FaList,
  FaTimes,
  FaMapMarkerAlt
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import StatCard from "../components/StatCard";

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.agri.token);
  const user = useSelector((state) => state.agri.user);
  const schemes = useSelector((state) => state.agri.schemes) || [];

  const [officers, setOfficers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Admin Event Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    category: "WORKSHOP"
  });

  // Event Attendees Roster Modal ("Who will go")
  const [selectedEventRoster, setSelectedEventRoster] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [officerRes, farmerRes, schemeRes, eventRes] = await Promise.allSettled([
        userApi.getAllOfficers(token),
        userApi.getAllFarmers(token),
        schemeApi.getAllSchemes(token),
        eventApi.getAllEvents(token)
      ]);

      if (officerRes.status === "fulfilled") {
        setOfficers(officerRes.value || []);
      }
      if (farmerRes.status === "fulfilled") {
        setFarmers(farmerRes.value || []);
      }
      if (schemeRes.status === "fulfilled") {
        dispatch(setSchemes(schemeRes.value || []));
      }
      if (eventRes.status === "fulfilled") {
        setEvents(Array.isArray(eventRes.value) ? eventRes.value : []);
      }
    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleVerifyOfficer = async (officerId) => {
    try {
      setActionLoadingId(officerId);
      await userApi.verifyOfficer(token, officerId, true);
      toast.success("Officer approved successfully!");
      fetchDashboardData();
    } catch (err) {
      console.error("Approve officer error:", err);
      toast.error(err.message || "Failed to approve officer.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create Event Submit
  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.eventDate) {
      toast.error("Please fill in event title and date");
      return;
    }

    try {
      setCreateSubmitting(true);
      await eventApi.createEvent(token, newEvent);
      toast.success("Important event published for farmers!");
      setShowCreateModal(false);
      setNewEvent({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        category: "WORKSHOP"
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to create event", err);
      toast.error(err.message || "Failed to create event");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventApi.deleteEvent(token, eventId);
      toast.success("Event deleted successfully.");
      fetchDashboardData();
    } catch (err) {
      console.error("Delete event error", err);
      toast.error(err.message || "Failed to delete event.");
    }
  };

  // Open Attendees Roster ("Who will go")
  const handleViewAttendees = async (evt) => {
    const eventId = evt.event_id || evt.eventId || evt.id;
    setSelectedEventRoster(evt);
    setLoadingAttendees(true);
    try {
      const data = await eventApi.getEventRegistrations(token, eventId);
      setAttendees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load attendees", err);
      toast.error("Failed to load attendee responses");
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const pendingOfficers = officers.filter((officer) => !officer.isVerified);
  const verifiedOfficers = officers.filter((officer) => officer.isVerified);

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN SECTION */}
      <main className="admin-main">
        {/* TOP NAVBAR */}
        <AdminNavbar />

        <div className="admin-content">
          {/* HERO SECTION */}
          <section className="admin-hero">
            <div className="hero-content">
              <span className="hero-tag">AGRISMART ADMIN PORTAL</span>
              <h1>Welcome Back, {user?.name || "Admin"} 👋</h1>
              <p>
                Manage agricultural schemes, mark out important farmer events,
                and monitor the AgriSmart ecosystem from one intelligent dashboard.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button className="hero-button" onClick={() => navigate("/admin/schemes")}>
                  View Schemes
                </button>
                <button
                  className="hero-button"
                  style={{ background: "#ffffff", color: "#166534", border: "none" }}
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus style={{ marginRight: 6 }} /> Post Farmer Event
                </button>
              </div>
            </div>
            <div className="hero-image"></div>
          </section>

          {/* STATISTICS */}
          <section className="stats-grid">
            <StatCard
              title="Total Farmers"
              value={loading ? "..." : farmers.length}
              icon={<FaUsers />}
            />

            <StatCard
              title="Total Officers"
              value={loading ? "..." : officers.length}
              icon={<FaTractor />}
            />

            <StatCard
              title="Active Schemes"
              value={loading ? "..." : schemes.length}
              icon={<FaSeedling />}
            />

            <StatCard
              title="Important Events"
              value={loading ? "..." : events.length}
              icon={<FaCalendarAlt />}
            />

            <StatCard
              title="Verified Officers"
              value={loading ? "..." : verifiedOfficers.length}
              icon={<FaCheckCircle />}
            />

            <StatCard
              title="Pending Officers"
              value={loading ? "..." : pendingOfficers.length}
              icon={<FaUserClock />}
            />
          </section>

          {/* IMPORTANT EVENTS FOR FARMERS PANEL */}
          <section style={{ marginBottom: 30 }}>
            <div className="dashboard-panel" style={{ width: "100%" }}>
              <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 16 }}>
                <div>
                  <h2>Farmer Events & Attendance ("Who Will Go")</h2>
                  <p>Publish workshops, soil camps & scheme drives for farmers and track registrations.</p>
                </div>
                <button
                  className="approve-btn"
                  style={{ background: "#166534", color: "#fff", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700 }}
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus /> Mark Out New Event
                </button>
              </div>

              {events.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {events.map((evt) => {
                    const eventId = evt.event_id || evt.eventId || evt.id;
                    return (
                      <div key={eventId} style={{ background: "#f8fafc", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ fontSize: 10, background: "#dcfce7", color: "#166534", fontWeight: 800, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                              {evt.category || "EVENT"}
                            </span>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                              🗓 {evt.event_date || evt.eventDate}
                            </span>
                          </div>

                          <h3 style={{ margin: "8px 0 4px", fontSize: 16, color: "#0f172a" }}>{evt.title}</h3>
                          <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>
                            <FaMapMarkerAlt style={{ color: "#ef4444", marginRight: 4 }} />
                            {evt.location || "District Office"}
                          </p>

                          {evt.description && (
                            <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>
                              {evt.description}
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px dashed #cbd5e1" }}>
                          <button
                            style={{ flex: 1, background: "#0284c7", color: "#fff", border: "none", padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                            onClick={() => handleViewAttendees(evt)}
                          >
                            <FaList /> View Who Will Go
                          </button>
                          <button
                            style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                            onClick={() => handleDeleteEvent(eventId)}
                            title="Delete Event"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-data">No active farmer events. Click "+ Mark Out New Event" to create one.</p>
              )}
            </div>
          </section>

          {/* BOTTOM DASHBOARD */}
          <section className="dashboard-bottom">
            {/* RECENT SCHEMES */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Scheme Activity</h2>
                  <p>Latest agricultural schemes added to the platform.</p>
                </div>
              </div>

              {schemes.length > 0 ? (
                schemes.slice(0, 4).map((scheme) => (
                  <div className="activity-item" key={scheme.scheme_id || scheme.id}>
                    <div className="activity-icon">
                      <FaSeedling />
                    </div>

                    <div className="activity-info">
                      <h4>{scheme.scheme_name || scheme.title}</h4>
                      <p>{scheme.category} • {scheme.state || "All States"}</p>
                    </div>

                    <span className="status-active">
                      {scheme.scheme_name?.includes("[ARCHIVED]") ? "ARCHIVED" : "ACTIVE"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-data">No schemes found in database.</p>
              )}
            </div>

            {/* OFFICER REQUESTS */}
            <div className="dashboard-panel">
              <h2>Officer Requests</h2>
              <p className="panel-subtitle">Officers waiting for verification</p>

              {pendingOfficers.length > 0 ? (
                pendingOfficers.map((officer) => (
                  <div className="officer-mini" key={officer.userId}>
                    <div className="officer-avatar">
                      {officer.name?.charAt(0) || "O"}
                    </div>

                    <div className="officer-info">
                      <h4>{officer.name}</h4>
                      <p>{officer.district || "Pending Verification"}</p>
                    </div>

                    <button
                      className="approve-btn"
                      style={{ padding: "6px 10px", fontSize: "12px" }}
                      disabled={actionLoadingId === officer.userId}
                      onClick={() => handleVerifyOfficer(officer.userId)}
                    >
                      {actionLoadingId === officer.userId ? <FaSpinner className="fa-spin" /> : <FaCheck />}
                      Approve
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-data">No pending officer requests.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ background: "#166534", color: "#fff", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#fff" }}>Mark Out Important Farmer Event</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Soil Testing & Organic Farming Workshop"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Date *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.eventDate}
                    onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff" }}
                  >
                    <option value="WORKSHOP">Workshop / Training</option>
                    <option value="SOIL_TEST">Soil Testing Camp</option>
                    <option value="SCHEME_DRIVE">Scheme Drive</option>
                    <option value="EXPO">Agri Expo / Fair</option>
                    <option value="MEETING">Farmer Meeting</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Location / Venue</label>
                <input
                  type="text"
                  placeholder="e.g., Block Agri Office, Pollachi"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions or agenda for attending farmers..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #cbd5e1", background: "#f1f5f9", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={createSubmitting} style={{ flex: 2, padding: 12, borderRadius: 8, border: "none", background: "#166534", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {createSubmitting ? "Publishing..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ATTENDEES ROSTER MODAL ("Who Will Go") */}
      {selectedEventRoster && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 650, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ background: "#0284c7", color: "#fff", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontWeight: 800, opacity: 0.85 }}>
                  Farmer Attendee Roster
                </span>
                <h3 style={{ margin: "2px 0 0", fontSize: 18, color: "#fff" }}>
                  Who Will Go: {selectedEventRoster.title}
                </h3>
              </div>
              <button onClick={() => setSelectedEventRoster(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: 24, overflowY: "auto" }}>
              {loadingAttendees ? (
                <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>Loading farmer responses...</div>
              ) : attendees.length > 0 ? (
                <div>
                  <div style={{ background: "#f0f9ff", padding: 12, borderRadius: 10, border: "1px solid #bae6fd", marginBottom: 16, fontSize: 13, color: "#0369a1" }}>
                    <strong>Total Registered Farmers:</strong> {attendees.length} · <strong>Total Expected Headcount:</strong> {attendees.reduce((sum, a) => sum + (Number(a.attendees_count || a.attendeesCount) || 1), 0)} people
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 12px" }}>Farmer Name</th>
                        <th style={{ padding: "10px 12px" }}>Phone</th>
                        <th style={{ padding: "10px 12px", textAlign: "center" }}>Headcount</th>
                        <th style={{ padding: "10px 12px" }}>Remarks / Notes</th>
                        <th style={{ padding: "10px 12px" }}>RSVP Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees.map((row, idx) => (
                        <tr key={row.registration_id || row.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            {row.farmer_name || row.farmerName || "Farmer"}
                          </td>
                          <td style={{ padding: "12px", color: "#334155" }}>
                            {row.phone_number || row.phoneNumber || "N/A"}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", fontWeight: 700, color: "#166534" }}>
                            {row.attendees_count || row.attendeesCount || 1}
                          </td>
                          <td style={{ padding: "12px", color: "#64748b", fontSize: 12 }}>
                            {row.remarks || "—"}
                          </td>
                          <td style={{ padding: "12px", color: "#94a3b8", fontSize: 11 }}>
                            {row.registered_at ? new Date(row.registered_at).toLocaleDateString() : "Just now"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                  No farmers have registered for this event yet.
                </div>
              )}
            </div>

            <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", textAlign: "right" }}>
              <button onClick={() => setSelectedEventRoster(null)} style={{ background: "#475569", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
