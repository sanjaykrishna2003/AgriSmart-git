import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { schemeApi } from "../services/api";
import { setSchemes } from "../main";

import {
  FaPlus,
  FaTrash,
  FaSeedling,
  FaEdit,
  FaSpinner,
  FaTimes
} from "react-icons/fa";

import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminSchemes() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.agri.token);
  const schemes = useSelector((state) => state.agri.schemes) || [];

  const [loading, setLoading] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState(null);

  const [formData, setFormData] = useState({
    schemeName: "",
    category: "Financial Support",
    description: "",
    benefits: "",
    eligibilityCriteria: "",
    requiredDocuments: "",
    officialLink: "",
    state: "All States"
  });

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const data = await schemeApi.getAllSchemes(token);
      dispatch(setSchemes(data || []));
    } catch (err) {
      console.error("Failed to load schemes:", err);
      toast.error("Failed to fetch schemes list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSchemes();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const startEdit = (scheme) => {
    setEditingSchemeId(scheme.scheme_id);
    setFormData({
      schemeName: scheme.scheme_name || "",
      category: scheme.category || "Financial Support",
      description: scheme.description || "",
      benefits: scheme.benefits || "",
      eligibilityCriteria: scheme.eligibility_criteria || "",
      requiredDocuments: scheme.required_documents || "",
      officialLink: scheme.official_link || "",
      state: scheme.state || "All States"
    });
  };

  const cancelEdit = () => {
    setEditingSchemeId(null);
    setFormData({
      schemeName: "",
      category: "Financial Support",
      description: "",
      benefits: "",
      eligibilityCriteria: "",
      requiredDocuments: "",
      officialLink: "",
      state: "All States"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.schemeName || !formData.category || !formData.description) {
      toast.error("Please fill in Scheme Name, Category, and Description.");
      return;
    }

    try {
      if (editingSchemeId) {
        await schemeApi.updateScheme(token, editingSchemeId, formData);
        toast.success("Government scheme updated successfully!");
      } else {
        await schemeApi.createScheme(token, formData);
        toast.success("New government scheme added successfully!");
      }

      cancelEdit();
      fetchSchemes();
    } catch (err) {
      console.error("Scheme save error:", err);
      toast.error(err.message || "Failed to save scheme.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete/archive "${name}"?`)) {
      return;
    }

    try {
      await schemeApi.deleteScheme(token, id);
      toast.success("Scheme processed (deleted/archived to preserve application records).");
      fetchSchemes();
    } catch (err) {
      console.error("Delete scheme error:", err);
      toast.error(err.message || "Failed to delete scheme.");
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
            <span className="page-tag">AGRICULTURAL SUPPORT</span>
            <h1>Manage Schemes</h1>
            <p>Create, update, and manage government schemes available for farmers.</p>
          </div>

          <div className="scheme-layout">
            {/* ADD / EDIT SCHEME FORM */}
            <div className="add-scheme-card">
              <div className="form-heading">
                <div className="form-icon">
                  {editingSchemeId ? <FaEdit /> : <FaPlus />}
                </div>

                <div>
                  <h2>{editingSchemeId ? "Edit Scheme" : "Add New Scheme"}</h2>
                  <p>{editingSchemeId ? "Modify existing scheme parameters." : "Enter the scheme details below."}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* SCHEME TITLE */}
                <div className="form-group">
                  <label>Scheme Name / Title *</label>
                  <input
                    type="text"
                    name="schemeName"
                    value={formData.schemeName}
                    onChange={handleChange}
                    placeholder="e.g. PM-KISAN, Free Power Scheme"
                    required
                  />
                </div>

                {/* CATEGORY & STATE */}
                <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                      <option value="Financial Support">Financial Support</option>
                      <option value="Financial Assistance">Financial Assistance</option>
                      <option value="Loans">Loans</option>
                      <option value="Insurance">Crop Insurance</option>
                      <option value="Subsidies">Subsidies</option>
                      <option value="Equipment">Equipment Support</option>
                    </select>
                  </div>

                  <div>
                    <label>Applicable State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="All States or specific state"
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the objective and details of the scheme..."
                    required
                  />
                </div>

                {/* BENEFITS */}
                <div className="form-group">
                  <label>Benefits & Subsidies</label>
                  <input
                    type="text"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder="e.g. ₹6,000 per year or 50% subsidy"
                  />
                </div>

                {/* ELIGIBILITY CRITERIA */}
                <div className="form-group">
                  <label>Eligibility Criteria</label>
                  <textarea
                    name="eligibilityCriteria"
                    value={formData.eligibilityCriteria}
                    onChange={handleChange}
                    placeholder="e.g. Small & marginal farmers with cultivable land..."
                    style={{ minHeight: "80px" }}
                  />
                </div>

                {/* OFFICIAL LINK */}
                <div className="form-group">
                  <label>Official Portal Link</label>
                  <input
                    type="text"
                    name="officialLink"
                    value={formData.officialLink}
                    onChange={handleChange}
                    placeholder="https://pmkisan.gov.in"
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="add-scheme-btn" style={{ flex: 1 }}>
                    {editingSchemeId ? <FaEdit /> : <FaPlus />}
                    {editingSchemeId ? "Update Scheme" : "Add Scheme"}
                  </button>

                  {editingSchemeId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="add-scheme-btn"
                      style={{ background: "#7d806f", flex: "0 0 100px" }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* SCHEMES LIST */}
            <div className="schemes-list-card">
              <div className="list-header">
                <div>
                  <h2>Available Schemes</h2>
                  <p>{schemes.length} active government schemes registered in DB</p>
                </div>
              </div>

              <div className="scheme-list">
                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--admin-muted)" }}>
                    <FaSpinner className="fa-spin" style={{ fontSize: "28px", marginBottom: "10px" }} />
                    <p>Loading schemes from database...</p>
                  </div>
                ) : schemes.length > 0 ? (
                  schemes.map((scheme) => (
                    <div className="scheme-item" key={scheme.scheme_id || scheme.id}>
                      <div className="scheme-icon">
                        <FaSeedling />
                      </div>

                      <div className="scheme-info">
                        <h3>{scheme.scheme_name || scheme.title}</h3>
                        <span>{scheme.category} • {scheme.state || "All States"}</span>
                        <p>{scheme.description}</p>
                        {scheme.benefits && (
                          <p style={{ marginTop: "4px", color: "var(--admin-olive)", fontWeight: "500" }}>
                            🎁 {scheme.benefits}
                          </p>
                        )}
                      </div>

                      <div className="scheme-actions">
                        <span className="status-active">
                          {scheme.scheme_name?.includes("[ARCHIVED]") ? "ARCHIVED" : "ACTIVE"}
                        </span>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="delete-scheme-btn"
                            style={{ background: "#edf1e5", color: "var(--admin-olive)" }}
                            onClick={() => startEdit(scheme)}
                            title="Edit Scheme"
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="delete-scheme-btn"
                            onClick={() => handleDelete(scheme.scheme_id || scheme.id, scheme.scheme_name || scheme.title)}
                            title="Delete / Archive Scheme"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-schemes">
                    <FaSeedling />
                    <h3>No Schemes Available</h3>
                    <p>Add your first agricultural scheme using the form.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminSchemes;
