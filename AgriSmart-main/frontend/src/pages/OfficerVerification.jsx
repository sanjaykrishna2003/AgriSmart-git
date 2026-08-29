import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { userApi } from "../services/api";

import {
  FaCheck,
  FaTimes,
  FaUserShield,
  FaSpinner,
  FaMapMarkerAlt,
  FaEdit,
  FaSave
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function OfficerVerification() {
  const token = useSelector((state) => state.agri.token);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Assign Region State
  const [editingOfficerId, setEditingOfficerId] = useState(null);
  const [regionForm, setRegionForm] = useState({ district: "", state: "" });

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllOfficers(token);
      setOfficers(data || []);
    } catch (err) {
      console.error("Failed to load officers:", err);
      toast.error(err.message || "Failed to load officers list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOfficers();
    }
  }, [token]);

  const handleVerify = async (officerId, verified) => {
    try {
      setActionLoadingId(officerId);
      await userApi.verifyOfficer(token, officerId, verified);
      toast.success(verified ? "Officer verified & approved successfully!" : "Officer verification status revoked.");
      fetchOfficers();
    } catch (err) {
      console.error("Failed to update officer status:", err);
      toast.error(err.message || "Failed to update officer status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const startAssignRegion = (officer) => {
    setEditingOfficerId(officer.userId);
    setRegionForm({
      district: officer.district || "",
      state: officer.state || ""
    });
  };

  const handleAssignSubmit = async (officerId) => {
    if (!regionForm.district || !regionForm.state) {
      toast.error("Please provide both District and State.");
      return;
    }

    try {
      setActionLoadingId(officerId);
      await userApi.assignOfficerRegion(token, officerId, {
        district: regionForm.district,
        state: regionForm.state
      });
      toast.success("Officer region assigned successfully!");
      setEditingOfficerId(null);
      fetchOfficers();
    } catch (err) {
      console.error("Failed to assign region:", err);
      toast.error(err.message || "Failed to assign officer region.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = officers.filter((o) => !o.isVerified).length;
  const verifiedCount = officers.filter((o) => o.isVerified).length;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminNavbar />

        <div className="admin-content">
          {/* PAGE HEADING */}
          <div className="page-heading">
            <span className="page-tag">ADMIN VERIFICATION & ASSIGNMENT</span>
            <h1>Officer Verification & Region Assignment</h1>
            <p>Review officer registration requests, assign jurisdiction regions, and verify authorized agriculture officers.</p>
          </div>

          {/* VERIFICATION SUMMARY */}
          <div className="verification-summary">
            <div className="verification-summary-card">
              <span>Pending Requests</span>
              <h2>{pendingCount}</h2>
            </div>

            <div className="verification-summary-card">
              <span>Verified Officers</span>
              <h2>{verifiedCount}</h2>
            </div>

            <div className="verification-summary-card">
              <span>Total Officers</span>
              <h2>{officers.length}</h2>
            </div>
          </div>

          {/* OFFICER LIST */}
          <div className="verification-list">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--admin-muted)" }}>
                <FaSpinner className="fa-spin" style={{ fontSize: "28px", marginBottom: "10px" }} />
                <p>Loading registered officers...</p>
              </div>
            ) : officers.length > 0 ? (
              officers.map((officer) => (
                <div className="verification-card" key={officer.userId} style={{ flexDirection: "column", alignItems: "stretch", gap: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                    {/* OFFICER DETAILS */}
                    <div className="verification-profile">
                      <div className="large-avatar">
                        <FaUserShield />
                      </div>

                      <div className="verification-details">
                        <h2>{officer.name}</h2>
                        <p>{officer.email} • {officer.phone || "No phone"}</p>
                        <span className="officer-district" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <FaMapMarkerAlt />
                          {officer.district ? `${officer.district}, ${officer.state}` : "Region Unassigned"}
                        </span>
                      </div>
                    </div>

                    {/* STATUS AND ACTIONS */}
                    <div className="verification-actions">
                      <span className={`verification-status ${officer.isVerified ? "verified" : "pending"}`}>
                        {officer.isVerified ? "Verified" : "Pending"}
                      </span>

                      <button
                        className="approve-btn"
                        style={{ background: "#56613d" }}
                        onClick={() => startAssignRegion(officer)}
                      >
                        <FaEdit />
                        Assign Region
                      </button>

                      {!officer.isVerified ? (
                        <button
                          className="approve-btn"
                          disabled={actionLoadingId === officer.userId}
                          onClick={() => handleVerify(officer.userId, true)}
                        >
                          {actionLoadingId === officer.userId ? <FaSpinner className="fa-spin" /> : <FaCheck />}
                          Approve
                        </button>
                      ) : (
                        <button
                          className="reject-btn"
                          disabled={actionLoadingId === officer.userId}
                          onClick={() => handleVerify(officer.userId, false)}
                        >
                          {actionLoadingId === officer.userId ? <FaSpinner className="fa-spin" /> : <FaTimes />}
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>

                  {/* INLINE REGION ASSIGNMENT FORM */}
                  {editingOfficerId === officer.userId && (
                    <div style={{ background: "#faf8f2", padding: "15px", borderRadius: "12px", border: "1px solid #e5e0d5", marginTop: "10px" }}>
                      <h4 style={{ margin: "0 0 10px 0", color: "var(--admin-dark-olive)", fontSize: "14px" }}>
                        Assign Regional Jurisdiction for {officer.name}
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: "10px", alignItems: "center" }}>
                        <input
                          type="text"
                          placeholder="District (e.g. Coimbatore, Ambala)"
                          value={regionForm.district}
                          onChange={(e) => setRegionForm({ ...regionForm, district: e.target.value })}
                          style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "8px" }}
                        />
                        <input
                          type="text"
                          placeholder="State (e.g. Tamil Nadu, Haryana)"
                          value={regionForm.state}
                          onChange={(e) => setRegionForm({ ...regionForm, state: e.target.value })}
                          style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "8px" }}
                        />
                        <button
                          className="approve-btn"
                          disabled={actionLoadingId === officer.userId}
                          onClick={() => handleAssignSubmit(officer.userId)}
                        >
                          {actionLoadingId === officer.userId ? <FaSpinner className="fa-spin" /> : <FaSave />} Save Region
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => setEditingOfficerId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-data" style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "18px" }}>
                <p>No agricultural officers registered yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OfficerVerification;
