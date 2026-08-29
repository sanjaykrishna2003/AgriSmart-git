import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { adminApi } from "../services/api";
import { FaHistory, FaSpinner, FaUserShield, FaFileAlt, FaMapMarkerAlt } from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminAuditLogs() {
  const token = useSelector((state) => state.agri.token);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAuditLogs(token);
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      toast.error(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAuditLogs();
    }
  }, [token]);

  const getActionBadgeClass = (action) => {
    switch (action) {
      case "OFFICER_VERIFIED":
      case "SCHEME_CREATED":
        return "badge-active";
      case "OFFICER_REVOKED":
      case "SCHEME_DELETED":
        return "badge-inactive";
      case "OFFICER_ASSIGNED":
      case "SCHEME_UPDATED":
        return "badge-pending";
      case "SCHEME_ARCHIVED":
        return "badge-pending";
      default:
        return "badge-active";
    }
  };

  const getTargetIcon = (targetType) => {
    switch (targetType) {
      case "OFFICER":
        return <FaUserShield style={{ marginRight: "6px" }} />;
      case "SCHEME":
        return <FaFileAlt style={{ marginRight: "6px" }} />;
      default:
        return <FaHistory style={{ marginRight: "6px" }} />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminNavbar />

        <div className="admin-content">
          {/* PAGE HEADING */}
          <div className="page-heading">
            <span className="page-tag">SECURITY & AUDIT TRAIL</span>
            <h1>System Audit Logs</h1>
            <p>Append-only audit history of administrative actions, officer verifications, region assignments, and scheme modifications.</p>
          </div>

          {/* TABLE CONTAINER */}
          <div className="table-container" style={{ background: "white", padding: "20px", borderRadius: "18px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--admin-muted)" }}>
                <FaSpinner className="fa-spin" style={{ fontSize: "28px", marginBottom: "10px" }} />
                <p>Loading audit trail records...</p>
              </div>
            ) : logs.length > 0 ? (
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid #f0eee6", color: "var(--admin-muted)", fontSize: "12px", textTransform: "uppercase" }}>
                    <th style={{ padding: "12px" }}>Timestamp</th>
                    <th style={{ padding: "12px" }}>Action</th>
                    <th style={{ padding: "12px" }}>Actor</th>
                    <th style={{ padding: "12px" }}>Target</th>
                    <th style={{ padding: "12px" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id || log.logId} style={{ borderBottom: "1px solid #f7f5ee" }}>
                      <td style={{ padding: "14px 12px", fontSize: "13px", color: "#666", whiteSpace: "nowrap" }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span className={`status-badge ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: "14px 12px", fontWeight: "600", color: "var(--admin-dark-olive)" }}>
                        {log.actorName || `Admin #${log.actorId}`}
                      </td>
                      <td style={{ padding: "14px 12px", color: "#444" }}>
                        {getTargetIcon(log.targetType)}
                        {log.targetType} #{log.targetId}
                      </td>
                      <td style={{ padding: "14px 12px", color: "#555", fontSize: "13px" }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                <p>No audit log entries recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminAuditLogs;
