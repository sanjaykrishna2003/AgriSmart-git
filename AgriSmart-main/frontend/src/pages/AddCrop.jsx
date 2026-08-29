import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";
import {
  ArrowLeft,
  Tractor,
  Wheat,
  MapPinned,
  Leaf,
  Brain,
  Plus,
  Trash2
} from "lucide-react";

import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";

import "../styles/sid.css";
import { addCropAction } from "../main";
import LeafletMap from "../components/LeafletMap";
import { aiApi } from "../services/api";

// Fix Leaflet marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Fit map to farm boundary
function FitBoundsToFarm({ farmPolygon }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (farmPolygon && farmPolygon.length >= 3) {
      const bounds = L.latLngBounds(farmPolygon);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
    }
  }, [farmPolygon, map]);
  return null;
}

// Click listener to draw crop area strictly within farm boundaries
function CropMapClickHandler({ farmPolygon, cropCoordinates, setCropCoordinates, setLandUsed }) {
  useMapEvents({
    click(e) {
      if (!farmPolygon || farmPolygon.length < 3) {
        toast.warning("Please select a farm with a valid registered boundary first.");
        return;
      }

      // 1. Create a Turf polygon of the farm (Turf expects [lng, lat])
      const farmGeoJson = turf.polygon([
        farmPolygon.map(p => [p[1], p[0]]).concat([[farmPolygon[0][1], farmPolygon[0][0]]])
      ]);

      // 2. Add 5m buffer tolerance so points near or on the boundary edge are accepted smoothly
      const bufferedFarm = turf.buffer(farmGeoJson, 0.005, { units: "kilometers" });

      // 3. Check if clicked point is inside the buffered farm polygon
      const clickPoint = turf.point([e.latlng.lng, e.latlng.lat]);
      const isInside = turf.booleanPointInPolygon(clickPoint, bufferedFarm);

      if (!isInside) {
        toast.warning("Click is outside your farm boundary! Crop area must be located entirely within your own farm plot.");
        return;
      }

      const newCoords = [...cropCoordinates, [e.latlng.lat, e.latlng.lng]];
      setCropCoordinates(newCoords);

      // 3. If we have a crop polygon, calculate its area
      if (newCoords.length >= 3) {
        const cropGeoJson = turf.polygon([
          newCoords.map(p => [p[1], p[0]]).concat([[newCoords[0][1], newCoords[0][0]]])
        ]);
        const sqm = turf.area(cropGeoJson);
        const acres = sqm * 0.000247105;
        setLandUsed(Number(acres.toFixed(2)));
      }
    }
  });
  return null;
}

function AddCrop() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];
  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);

  const [selectedFarmId, setSelectedFarmId] = useState(
    farms.length > 0 ? String(farms[0].farmId) : ""
  );
  const [cropName, setCropName] = useState("Rice");
  const [plantingDate, setPlantingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [duration, setDuration] = useState(120);
  const [landUsed, setLandUsed] = useState(1.0);
  const [useMap, setUseMap] = useState(true);
  const [cropCoordinates, setCropCoordinates] = useState([]);

  const weather = useSelector((state) => state.agri.weather);
  const user = useSelector((state) => state.agri.user);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGetAiRecommendation = async () => {
    if (!selectedFarm) {
      toast.warning("Please select a farm plot first!");
      return;
    }
    setLoadingAi(true);
    const n = user?.nitrogen || 90;
    const p = user?.phosphorus || 42;
    const k = user?.potassium || 43;
    const ph = user?.soilPh || 6.5;
    const temp = weather?.temperature || 25.5;
    const hum = weather?.humidity || 80.0;
    const rain = weather?.rainfall || 200.0;

    const rawLoc = selectedFarm.location || user?.district || "";
    const cleanLoc = rawLoc.includes(" | ") ? rawLoc.split(" | ")[0].trim() : rawLoc.trim();

    const payload = {
      nitrogen: Number(n),
      phosphorus: Number(p),
      potassium: Number(k),
      ph: Number(ph),
      soilType: selectedFarm.soilType || "Loamy Soil",
      temperature: Number(temp),
      humidity: Number(hum),
      rainfall: Number(rain),
      season: "Monsoon",
      waterAvailability: selectedFarm.waterSource || "Medium",
      location: cleanLoc
    };

    try {
      const res = await aiApi.getCropRecommendation(payload);
      if (res && res.recommendations && res.recommendations.length > 0) {
        setRecommendations(res.recommendations);
        toast.success(`AI ML Recommendations generated for ${selectedFarm.farmName}!`);
      } else {
        toast.error("ML model did not return any recommendations.");
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Error from ML recommendation service:", err);
      if (err.status === 422) {
        toast.error(`ML model validation error (422): ${err.message}`);
      } else if (err.name === "TypeError" || err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        toast.error("ML recommendation service is offline (port 8000).");
      } else {
        toast.error(`ML recommendation service error (${err.status || "HTTP Error"}): ${err.message}`);
      }
      setRecommendations([]);
    } finally {
      setLoadingAi(false);
    }
  };

  const selectedFarm = farms.find((f) => String(f.farmId) === selectedFarmId);

  // Parse farm coordinates
  const farmCoordinates = useMemo(() => {
    if (!selectedFarm) return [];
    
    // Parse from serialized location field
    if (selectedFarm.location && selectedFarm.location.includes(" | ")) {
      try {
        const coords = JSON.parse(selectedFarm.location.split(" | ")[1]);
        if (Array.isArray(coords) && coords.length >= 3) {
          return coords;
        }
      } catch (e) {
        console.error("Failed to parse farm coordinates from location string", e);
      }
    }

    // Try localStorage fallback
    const saved = localStorage.getItem(`farm_coords_${selectedFarm.farmId}`);
    if (saved) {
      try {
        const coords = JSON.parse(saved);
        if (Array.isArray(coords) && coords.length >= 3) {
          return coords;
        }
      } catch (e) {}
    }

    // Default bounding box if missing
    if (selectedFarm.latitude && selectedFarm.longitude) {
      const lat = selectedFarm.latitude;
      const lng = selectedFarm.longitude;
      const d = 0.0006;
      return [
        [lat - d, lng - d],
        [lat + d, lng - d],
        [lat + d, lng + d],
        [lat - d, lng + d]
      ];
    }

    return [];
  }, [selectedFarm]);

  // Parse crop coordinates from description or localStorage
  const parseCropCoordinates = (c) => {
    if (c.description && c.description.includes("Coordinates: ")) {
      try {
        const coordsStr = c.description.split("Coordinates: ")[1];
        const coords = JSON.parse(coordsStr);
        if (Array.isArray(coords) && coords.length >= 3) {
          return coords;
        }
      } catch (e) {
        console.error("Failed to parse crop coordinates from description", e);
      }
    }
    const saved = localStorage.getItem(`crop_coords_${c.cropId}`);
    if (saved) {
      try {
        const coords = JSON.parse(saved);
        if (Array.isArray(coords) && coords.length >= 3) {
          return coords;
        }
      } catch (e) {}
    }
    return null;
  };

  // Find other active crops on this farm to display as red polygons
  const activeCropPolygons = useMemo(() => {
    if (!selectedFarmId) return [];
    return crops
      .filter((c) => Number(c.farmId) === Number(selectedFarmId) && c.status === "ACTIVE")
      .map((c) => ({
        cropId: c.cropId,
        cropName: c.cropName,
        coordinates: parseCropCoordinates(c)
      }))
      .filter((ap) => ap.coordinates !== null);
  }, [crops, selectedFarmId]);

  // Clean farm name/village display helper
  const cleanFarmName = (farm) => {
    const locName = farm.location ? farm.location.split(" | ")[0] : "Coimbatore";
    return `${farm.farmName} (${locName})`;
  };

  // Derive dynamic AI crop recommendations based on soil type
  const getAiRecommendations = () => {
    if (!selectedFarm) return [];
    const soil = selectedFarm.soilType.toLowerCase();
    if (soil.includes("black") || soil.includes("clay")) {
      return [
        { crop: "Rice", compat: "95%" },
        { crop: "Cotton", compat: "92%" },
        { crop: "Sugarcane", compat: "88%" },
      ];
    } else if (soil.includes("sandy")) {
      return [
        { crop: "Groundnut", compat: "91%" },
        { crop: "Maize", compat: "87%" },
        { crop: "Millet", compat: "82%" },
      ];
    } else {
      return [
        { crop: "Wheat", compat: "94%" },
        { crop: "Maize", compat: "90%" },
        { crop: "Pulses", compat: "85%" },
      ];
    }
  };

  const aiSuggestions = getAiRecommendations();

  // Reset crop coordinates when changing selected farm
  useEffect(() => {
    setCropCoordinates([]);
  }, [selectedFarmId]);

  const handleSuggestionClick = (suggestedCrop) => {
    setCropName(suggestedCrop);
    if (suggestedCrop === "Sugarcane") setDuration(300);
    else if (suggestedCrop === "Cotton") setDuration(150);
    else if (suggestedCrop === "Rice") setDuration(120);
    else if (suggestedCrop === "Wheat") setDuration(120);
    else if (suggestedCrop === "Groundnut") setDuration(105);
    else setDuration(120);
    toast.info(`Pre-filled crop type: ${suggestedCrop}`);
  };

  const handleRegisterCrop = async (e) => {
    e.preventDefault();

    if (!selectedFarmId) {
      toast.error("Please select or register a farm first.");
      return;
    }

    if (useMap && cropCoordinates.length < 3) {
      toast.error("Please draw a valid boundary polygon for the crop area on the map.");
      return;
    }

    if (useMap && cropCoordinates.length >= 3) {
      const newCropPoly = turf.polygon([
        cropCoordinates.map(p => [p[1], p[0]]).concat([[cropCoordinates[0][1], cropCoordinates[0][0]]])
      ]);

      for (const existing of activeCropPolygons) {
        if (existing.coordinates && existing.coordinates.length >= 3) {
          try {
            const existingPoly = turf.polygon([
              existing.coordinates.map(p => [p[1], p[0]]).concat([[existing.coordinates[0][1], existing.coordinates[0][0]]])
            ]);
            const intersection = turf.intersect(turf.featureCollection([newCropPoly, existingPoly]));
            if (intersection) {
              toast.error(`Overlap detected! Part of your selection lies inside the existing active crop area: "${existing.cropName}". Please select another area of the farm.`);
              return;
            }
          } catch (err) {
            console.error("Turf intersection validation error", err);
          }
        }
      }
    }

    const durationDays = Number(duration) || 120;
    const planted = new Date(plantingDate);
    const expectedHarvest = new Date(
      planted.getTime() + durationDays * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    // Serialize crop coordinates and area in the description field
    const serializedDesc = cropCoordinates.length > 0
      ? `Area: ${landUsed} Acres | Coordinates: ${JSON.stringify(cropCoordinates)}`
      : `Cultivated Area: ${landUsed} Acres`;

    const payload = {
      cropName: cropName,
      duration: durationDays,
      description: serializedDesc,
      status: "ACTIVE",
      season: "KHARIF",
      plantedDate: plantingDate,
      expectedHarvestDate: expectedHarvest,
      farmId: Number(selectedFarmId),
      area: Number(landUsed) || 1.0
    };

    try {
      if (!demoMode) {
        const res = await fetch("http://localhost:8083/api/crops", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const createdCrop = await res.json();
          // Store crop coordinates locally for matching references
          localStorage.setItem(`crop_coords_${createdCrop.cropId}`, JSON.stringify(cropCoordinates));
          try {
            const existingStr = localStorage.getItem('demo_crops');
            let list = existingStr ? JSON.parse(existingStr) : [...crops];
            list.push(createdCrop);
            localStorage.setItem('demo_crops', JSON.stringify(list));
          } catch (e) {}
          dispatch(addCropAction(createdCrop));
          toast.success("Crop registered successfully inside farm boundaries!");
          navigate("/crops");
          return;
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to save crop.");
        }
      }
    } catch (err) {
      console.warn("Crop Service offline, adding locally.", err);
    }

    // Mock/Demo Mode Fallback
    const mockCropId = Date.now();
    const mockCrop = {
      ...payload,
      cropId: mockCropId,
      yield: null,
    };
    localStorage.setItem(`crop_coords_${mockCropId}`, JSON.stringify(cropCoordinates));
    try {
      const existingStr = localStorage.getItem('demo_crops');
      let list = existingStr ? JSON.parse(existingStr) : [...crops];
      list.push(mockCrop);
      localStorage.setItem('demo_crops', JSON.stringify(list));
    } catch (e) {}
    dispatch(addCropAction(mockCrop));
    toast.success("Crop registered locally (Demo Mode)!");
    navigate("/crops");
  };

  return (
    <>
      <Navbar />

      <div className="cropFormPage">
        {/* Header */}
        <div className="formHeader">
          <button className="backBtn" onClick={() => navigate("/crops")}>
            <ArrowLeft size={18} />
            Back
          </button>
          <h1>Add New Crop</h1>
          <p>
            Choose a farm, mark out the crop area inside its boundaries, and begin monitoring.
          </p>
        </div>

        {/* Main Content */}
        <div className="cropFormContainer">
          {/* Left Side */}
          <div className="cropFormCard">
            <h2>Crop Information</h2>
            <form onSubmit={handleRegisterCrop}>
              <div className="formGroup">
                <label>Select Farm</label>
                {farms.length > 0 ? (
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    required
                  >
                    {farms.map((f) => (
                      <option key={f.farmId} value={f.farmId}>
                        {cleanFarmName(f)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: "10px", color: "red", fontSize: "13px", background: "#fff0f0", borderRadius: "6px" }}>
                    No registered farms found. Please register a farm plot first!
                    <button
                      type="button"
                      onClick={() => navigate("/farm-management/add")}
                      style={{ marginLeft: "10px", textDecoration: "underline", color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      Add Farm Plot
                    </button>
                  </div>
                )}
              </div>

              <div className="formGroup">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label style={{ margin: 0 }}>Crop Name</label>
                  <button
                    type="button"
                    onClick={handleGetAiRecommendation}
                    disabled={loadingAi}
                    style={{
                      background: "linear-gradient(135deg,#16a34a,#15803d)",
                      color: "#fff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Brain size={14} /> {loadingAi ? "Analyzing Soil & Weather..." : "AI Recommend Crop"}
                  </button>
                </div>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                >
                  <option value="Rice">Rice</option>
                  <option value="Maize">Maize</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Mustard">Mustard</option>
                </select>

                {recommendations.length > 0 && (
                  <div style={{ marginTop: 12, background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#15803d" }}>
                        ✨ AI ML Recommendations for {selectedFarm ? selectedFarm.farmName : "Selected Farm"} ({selectedFarm ? selectedFarm.soilType : "Soil"}):
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {recommendations.map((rec, idx) => {
                        const rankLabels = ["🥇 Best Match", "🥈 2nd Choice", "🥉 3rd Choice", "4th Choice", "5th Choice"];
                        const rankLabel = rankLabels[idx] || `${idx + 1}th Choice`;
                        const cName = rec.cropName || rec.crop || "Crop";
                        const confPct = Math.round((rec.confidence || 0.90) * 100);
                        const isSelected = cropName.toLowerCase() === cName.toLowerCase();

                        return (
                          <div
                            key={idx}
                            style={{
                              background: isSelected ? "#ffffff" : "#f8fafc",
                              border: `1.5px solid ${isSelected ? "#16a34a" : "#cbd5e1"}`,
                              borderRadius: 10,
                              padding: "10px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: idx === 0 ? "#15803d" : "#334155" }}>
                                  {rankLabel}: <strong>{cName}</strong>
                                </span>
                                <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 800, background: "#dcfce7", color: "#15803d" }}>
                                  {confPct}% Match
                                </span>
                              </div>
                              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                                {rec.reasoning || (idx === 0
                                  ? `Optimal crop choice for ${selectedFarm ? selectedFarm.soilType : "this"} soil & ${selectedFarm ? selectedFarm.waterSource : "water"} source.`
                                  : `Suitable secondary crop choice for rotation.`)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setCropName(cName);
                                toast.info(`Selected ${cName} as your crop choice!`);
                              }}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "none",
                                background: isSelected ? "#15803d" : "#16a34a",
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: "pointer",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {isSelected ? "Selected ✓" : "Use Crop"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="formGroup">
                <label>Planting Date</label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Cultivation Duration (Days)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>

              <div className="formGroup">
                <label>Land Used (Acres)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 2.5"
                  value={landUsed}
                  onChange={(e) => setLandUsed(e.target.value)}
                  required
                  disabled={true}
                  style={{ backgroundColor: "#f1f5f9" }}
                />
                <span style={{ fontSize: "11.5px", color: "var(--primary)", marginTop: "4px", display: "block" }}>
                  ℹ Land acreage is calculated automatically from the interactive map boundary.
                </span>
              </div>

              <div style={{ marginTop: "15px", marginBottom: "20px" }}>
                <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#334155" }}>
                    📍 Interactive Crop Boundary Map (Required)
                  </label>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Drag ✥ handle to reposition plot or corner handles to reshape crop area.
                  </span>
                </div>

                <LeafletMap
                  farmCoordinates={farmCoordinates}
                  activeCropPolygons={activeCropPolygons}
                  onPolygonChange={({ coordinates, areaAcres }) => {
                    if (coordinates && coordinates.length >= 3) {
                      setCropCoordinates(coordinates);
                      setLandUsed(areaAcres > 0 ? areaAcres : 1.0);
                    }
                  }}
                />
              </div>

              <div className="formButtons">
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={() => navigate("/crops")}
                >
                  Cancel
                </button>
                <button className="submitBtn" type="submit">
                  <Plus size={18} />
                  Register Crop
                </button>
              </div>
            </form>
          </div>

          {/* Right Side */}
          <div className="cropSidePanel">
            {/* Farm Summary */}
            <div className="infoCard">
              <div className="cardTitle">
                <Tractor />
                <h3>Farm Summary</h3>
              </div>
              {selectedFarm ? (
                <>
                  <div className="summaryRow">
                    <span>Total Area</span>
                    <strong>{selectedFarm.area} Acres</strong>
                  </div>
                  <div className="summaryRow">
                    <span>Soil Type</span>
                    <strong>{selectedFarm.soilType}</strong>
                  </div>
                  <div className="summaryRow">
                    <span>Water Source</span>
                    <strong>{selectedFarm.waterSource}</strong>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "12px", color: "gray" }}>
                  Please select a farm to load stats.
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="infoCard">
              <div className="cardTitle">
                <Wheat />
                <h3>Quick Tips</h3>
              </div>
              <ul className="tips">
                <li>Select the correct farm plot.</li>
                <li>Your crop coordinates must sit entirely inside the orange farm polygon limits.</li>
                <li>Click points in order. You can clear the points using the "Clear Map" action.</li>
                <li>Crop acreage will be auto-calculated using Turf.js.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <FloatingAI />
      <Footer />
    </>
  );
}

export default AddCrop;