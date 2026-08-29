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
  FaCloudSun
} from "react-icons/fa";

import { deleteFarmAction } from "../main";

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
          <div className="detailsHeader">
            <div>
              <h1>{dbFarm.farmName}</h1>
              <p>
                <FaMapMarkerAlt /> {dbFarm.location ? dbFarm.location.split(" | ")[0] : ""}
              </p>
            </div>
            <span className="farmStatus">🟢 Healthy</span>
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
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
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

      <Footer />
    </>
  );
}