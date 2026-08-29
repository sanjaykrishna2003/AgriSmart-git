import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "../styles/farm.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";
import LeafletViewer from "../components/LeafletViewer";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaLeaf,
  FaTint,
  FaSeedling,
  FaEdit,
  FaTrash,
  FaWarehouse,
  FaCalendarAlt,
  FaCloudSun,
  FaLock,
  FaTimes,
  FaCheck
} from "react-icons/fa";

import { deleteFarmAction, updateFarmAction } from "../main";
import { farmApi } from "../services/api";

export default function FarmDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);
  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];
  const weather = useSelector((state) => state.agri.weather);

  const farmIdNum = Number(id);
  const [loading, setLoading] = useState(true);
  const [fetchedFarm, setFetchedFarm] = useState(null);

  // Edit Farm Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    farmName: "",
    soilType: "Clayey",
    waterSource: "Borewell",
    locationName: ""
  });

  useEffect(() => {
    const found = farms.find((f) => f.farmId === farmIdNum);
    if (found) {
      setFetchedFarm(found);
      setLoading(false);
      return;
    }

    if (!demoMode && token && id) {
      setLoading(true);
      fetch(`http://localhost:8082/api/farms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Farm not found");
        })
        .then((data) => {
          setFetchedFarm(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, farms, token, demoMode, farmIdNum]);

  const dbFarm = fetchedFarm || farms.find((f) => f.farmId === farmIdNum);

  // Open Edit Modal
  const openEditModal = () => {
    if (!dbFarm) return;
    const locParts = (dbFarm.location || "").split(" | ");
    setEditForm({
      farmName: dbFarm.farmName || "",
      soilType: dbFarm.soilType || "Clayey",
      waterSource: dbFarm.waterSource || "Borewell",
      locationName: locParts[0] || ""
    });
    setEditModalOpen(true);
  };

  // Submit Farm Edit to API
  const handleUpdateFarm = async (e) => {
    e.preventDefault();
    if (!editForm.farmName.trim()) {
      toast.error("Farm name is required");
      return;
    }
    setEditLoading(true);

    // Preserve polygon coordinates if present in location string
    let fullLocation = editForm.locationName;
    if (dbFarm.location && dbFarm.location.includes(" | ")) {
      const coordsPart = dbFarm.location.split(" | ").slice(1).join(" | ");
      fullLocation = `${editForm.locationName} | ${coordsPart}`;
    }

    const payload = {
      farmName: editForm.farmName,
      soilType: editForm.soilType,
      waterSource: editForm.waterSource,
      location: fullLocation,
      area: dbFarm.area,
      latitude: dbFarm.latitude,
      longitude: dbFarm.longitude
    };

    try {
      if (!demoMode && token) {
        const res = await fetch(`http://localhost:8082/api/farms/${dbFarm.farmId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updatedData = await res.json();
          const merged = { ...dbFarm, ...updatedData, location: fullLocation };
          dispatch(updateFarmAction(merged));
          setFetchedFarm(merged);
          toast.success("Farm specifications updated successfully in database!");
          setEditModalOpen(false);
          setEditLoading(false);
          return;
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || "Failed to update farm details.");
          setEditLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Farm API offline, updating locally", err);
    }

    const updatedLocal = {
      ...dbFarm,
      farmName: editForm.farmName,
      soilType: editForm.soilType,
      waterSource: editForm.waterSource,
      location: fullLocation
    };
    dispatch(updateFarmAction(updatedLocal));
    setFetchedFarm(updatedLocal);
    toast.success("Farm specifications updated!");
    setEditModalOpen(false);
    setEditLoading(false);
  };

  // Derive coordinates for LeafletViewer
  const mappedFarmForViewer = useMemo(() => {
    if (!dbFarm) return null;

    // 1. Try to read full polygon from localStorage
    const savedCoordsStr = localStorage.getItem(`farm_coords_${dbFarm.farmId}`);
    let coords = [];
    if (savedCoordsStr) {
      try {
        coords = JSON.parse(savedCoordsStr);
      } catch (e) {
        console.error("Failed to parse local coordinates", e);
      }
    }

    // 2. Read from DB location column if missing in localStorage
    if ((!coords || coords.length === 0) && dbFarm.location) {
      if (dbFarm.location.includes(" | ")) {
        try {
          const jsonPart = dbFarm.location.split(" | ").slice(1).join(" | ").trim();
          coords = JSON.parse(jsonPart);
        } catch (e) {}
      } else if (dbFarm.location.trim().startsWith("[")) {
        try {
          coords = JSON.parse(dbFarm.location);
        } catch (e) {}
      }
    }

    // 3. Fallback to center bounding box if missing polygon
    if ((!coords || coords.length === 0) && dbFarm.latitude && dbFarm.longitude) {
      const lat = dbFarm.latitude;
      const lng = dbFarm.longitude;
      const d = 0.0006; // tiny offset for boundary
      coords = [
        [lat - d, lng - d],
        [lat + d, lng - d],
        [lat + d, lng + d],
        [lat - d, lng + d]
      ];
    }

    const activeCrops = crops.filter(c => c.farmId === dbFarm.farmId && c.status === "ACTIVE");
    const cropNames = activeCrops.map(c => c.cropName).join(", ") || "None";

    return {
      name: dbFarm.farmName,
      coordinates: coords,
      soil: dbFarm.soilType || "Black Soil",
      area: `${dbFarm.area} Acres`,
      water: dbFarm.waterSource || "Borewell",
      village: dbFarm.location || "Coimbatore",
      state: "Tamil Nadu",
      crop: cropNames
    };
  }, [dbFarm, crops]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "100px 20px", textAlign: "center" }}>
          <h2>Loading Farm Details...</h2>
        </div>
        <Footer />
      </>
    );
  }

  if (!dbFarm) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "100px 20px", textAlign: "center" }}>
          <h2>Farm Plot Not Found</h2>
          <button className="backButton" onClick={() => navigate("/farm-management")}>
            <FaArrowLeft /> Back to Farms
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const activeCrops = crops.filter((c) => c.farmId === dbFarm.farmId && c.status === "ACTIVE");

  const handleDeleteFarm = async () => {
    if (!window.confirm("Are you sure you want to delete this farm? This will delete all registered crop logs on this farm as well.")) return;

    try {
      if (!demoMode) {
        const res = await fetch(`http://localhost:8082/api/farms/${dbFarm.farmId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          dispatch(deleteFarmAction(dbFarm.farmId));
          toast.success("Farm deleted successfully from database!");
          navigate("/farm-management");
          return;
        } else {
          toast.error("Failed to delete farm plot.");
          return;
        }
      }
    } catch (err) {
      console.warn("Farm microservice offline, removing locally.", err);
    }

    dispatch(deleteFarmAction(dbFarm.farmId));
    toast.success("Farm deleted locally (Demo Mode)!");
    navigate("/farm-management");
  };

  return (
    <>
      <Navbar />
      <FloatingAI />

      <div className="farmDetailsPage">
        <div className="farmDetailsContainer">
          <button className="backButton" onClick={() => navigate("/farm-management")}>
            <FaArrowLeft />
            Back to Farms
          </button>

          {/* HEADER */}
          <div className="detailsHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ textTransform: "capitalize" }}>{dbFarm.farmName}</h1>
              <p>
                <FaMapMarkerAlt /> {dbFarm.location ? dbFarm.location.split(" | ")[0] : ""}
              </p>
            </div>
            
            {/* Edit Farm Button replacing Healthy Badge */}
            <button
              onClick={openEditModal}
              style={{
                background: "#dcfce7",
                color: "#15803d",
                border: "1.5px solid #86efac",
                padding: "8px 18px",
                borderRadius: "20px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(22, 163, 74, 0.15)",
                transition: "all 0.2s"
              }}
            >
              <FaEdit /> Edit Farm Specifications
            </button>
          </div>

          {/* STATS */}
          <div className="farmStatsGrid">
            <div className="statCard">
              <FaSeedling />
              <span>Area</span>
              <h3>{dbFarm.area} Acres</h3>
            </div>

            <div className="statCard">
              <FaLeaf />
              <span>Soil Type</span>
              <h3>{dbFarm.soilType}</h3>
            </div>

            <div className="statCard">
              <FaTint />
              <span>Water Source</span>
              <h3>{dbFarm.waterSource}</h3>
            </div>

            <div className="statCard">
              <FaCloudSun />
              <span>Weather</span>
              <h3>{weather ? `${Math.round(weather.temperature)}°C` : "N/A"}</h3>
            </div>
          </div>

          {/* MAP & INFORMATION GRID */}
          <div className="detailsGrid">
            <div className="mapPanel">
              <h2>Geographical Boundary</h2>
              {mappedFarmForViewer && <LeafletViewer farm={mappedFarmForViewer} />}
            </div>

            <div className="infoPanel">
              <div className="cropsSection">
                <h2>Active Crops</h2>
                {activeCrops.length > 0 ? (
                  <div className="cropsList">
                    {activeCrops.map((crop) => (
                      <div className="cropItem" key={crop.cropId} onClick={() => navigate(`/crops/${crop.cropId}`)} style={{ cursor: "pointer" }}>
                        <div>
                          <h4>{crop.cropName}</h4>
                          <span>Planted: {new Date(crop.plantedDate).toLocaleDateString()}</span>
                        </div>
                        <span className="badge">Active</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="emptyCrops" style={{ padding: "20px", background: "#f8fafc", borderRadius: "10px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>No crops currently cultivated on this plot.</p>
                    <button
                      className="farmDetailsBtn"
                      style={{ margin: "10px auto 0 auto", padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => navigate("/crops/add")}
                    >
                      Cultivate Crop
                    </button>
                  </div>
                )}
              </div>

              <div className="actionsSection" style={{ marginTop: "24px" }}>
                <h2>Farm Management Actions</h2>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={openEditModal}
                    style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    <FaEdit /> Edit Farm Details
                  </button>

                  <button
                    className="deleteBtn"
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                    onClick={handleDeleteFarm}
                  >
                    <FaTrash /> Delete Farm Plot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT FARM MODAL */}
      {editModalOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 1000
            }}
            onClick={() => !editLoading && setEditModalOpen(false)}
          />

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(520px, 92vw)",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              zIndex: 1001,
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  Edit Farm Specifications
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                  Update plot specifications stored in database (Plot #{dbFarm.farmId})
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                disabled={editLoading}
                style={{ background: "transparent", border: "none", fontSize: "18px", color: "#64748b", cursor: "pointer" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateFarm} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Farm Name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Farm Plot Name <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.farmName}
                  onChange={(e) => setEditForm({ ...editForm, farmName: e.target.value })}
                  placeholder="e.g. Pollachi Farm"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Soil Type */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Soil Type
                </label>
                <select
                  value={editForm.soilType}
                  onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#fff"
                  }}
                >
                  <option value="Clayey">Clayey Soil</option>
                  <option value="Black Soil">Black Soil</option>
                  <option value="Red Soil">Red Soil</option>
                  <option value="Sandy Soil">Sandy Soil</option>
                  <option value="Loamy Soil">Loamy Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                </select>
              </div>

              {/* Water Source */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Water Source / Irrigation Method
                </label>
                <select
                  value={editForm.waterSource}
                  onChange={(e) => setEditForm({ ...editForm, waterSource: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#fff"
                  }}
                >
                  <option value="Borewell">Borewell</option>
                  <option value="Canal Irrigation">Canal Irrigation</option>
                  <option value="Rainfed">Rainfed</option>
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="River Water">River Water</option>
                  <option value="Open Well">Open Well</option>
                </select>
              </div>

              {/* Location Description */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Location / Village Name
                </label>
                <input
                  type="text"
                  value={editForm.locationName}
                  onChange={(e) => setEditForm({ ...editForm, locationName: e.target.value })}
                  placeholder="e.g. Pollachi, Coimbatore"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Read-Only Info Notice */}
              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                  <FaLock style={{ color: "#64748b" }} /> Protected GIS Properties (Read-Only)
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                  <span>Land Area:</span>
                  <strong>{dbFarm.area} Acres (GIS Boundary Fixed)</strong>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#16a34a",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {editLoading ? "Saving..." : <><FaCheck /> Save Specifications</>}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}