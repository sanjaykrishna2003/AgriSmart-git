import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "../styles/sid.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";
import LeafletViewer from "../components/LeafletViewer";

import {
  ArrowLeft,
  Leaf,
  TrendingUp,
  Calendar,
  Droplets,
  Sun,
  CloudRain,
  Brain,
  MapPinned,
  Activity,
  Sprout,
  CheckCircle,
  XCircle
} from "lucide-react";

import { updateCropAction } from "../main";

export default function CropDetails() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);
  const crops = useSelector((state) => state.agri.crops) || [];
  const farms = useSelector((state) => state.agri.farms) || [];
  const weather = useSelector((state) => state.agri.weather);

  const [harvestYield, setHarvestYield] = useState("");
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  const cropIdNum = Number(id);
  const [loading, setLoading] = useState(true);
  const [fetchedCrop, setFetchedCrop] = useState(null);

  useEffect(() => {
    const found = crops.find((c) => c.cropId === cropIdNum);
    if (found) {
      setFetchedCrop(found);
      setLoading(false);
      return;
    }

    if (!demoMode && token && id) {
      setLoading(true);
      fetch(`http://localhost:8083/api/crops/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Crop not found");
        })
        .then((data) => {
          setFetchedCrop(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, crops, token, demoMode, cropIdNum]);

  const crop = fetchedCrop || crops.find((c) => c.cropId === cropIdNum);
  const farm = crop ? farms.find((f) => f.farmId === crop.farmId) : null;

  const cropCoordinates = useMemo(() => {
    if (!crop || !crop.description) return [];
    if (crop.description.includes(" | Coordinates: ")) {
      try {
        const coords = JSON.parse(crop.description.split(" | Coordinates: ")[1]);
        if (Array.isArray(coords) && coords.length >= 3) return coords;
      } catch (e) {}
    }
    const saved = localStorage.getItem(`crop_coords_${crop.cropId}`);
    if (saved) {
      try {
        const coords = JSON.parse(saved);
        if (Array.isArray(coords) && coords.length >= 3) return coords;
      } catch (e) {}
    }
    return [];
  }, [crop]);

  // Helper functions
  const getRiceGrowthStage = (days) => {
    if (days < 20) return "Seedling Stage";
    if (days < 40) return "Tillering Stage";
    if (days < 70) return "Panicle Initiation";
    if (days < 90) return "Flowering Stage";
    if (days < 115) return "Grain Filling";
    return "Mature Stage";
  };

  const getGeneralGrowthStage = (days, duration) => {
    const pct = days / (duration || 120);
    if (pct < 0.15) return "Early Growth";
    if (pct < 0.5) return "Vegetative Stage";
    if (pct < 0.75) return "Flowering Stage";
    if (pct < 0.9) return "Yield Formation";
    return "Mature Stage";
  };

  const getGrowthStage = (name, days, duration) => {
    if ((name || "").toLowerCase().includes("rice") || (name || "").toLowerCase().includes("paddy")) {
      return getRiceGrowthStage(days);
    }
    return getGeneralGrowthStage(days, duration);
  };

  const getNPKRecommendations = (cropName, soilType) => {
    const name = (cropName || "").toLowerCase();
    
    // Standard requirements (N:P:K kg/ha)
    let reqN = 120, reqP = 60, reqK = 60;
    if (name.includes("cotton")) { reqN = 80; reqP = 40; reqK = 40; }
    else if (name.includes("wheat")) { reqN = 120; reqP = 50; reqK = 40; }
    else if (name.includes("groundnut")) { reqN = 20; reqP = 40; reqK = 40; }
    else if (name.includes("maize")) { reqN = 120; reqP = 60; reqK = 40; }
    else if (name.includes("sugarcane")) { reqN = 275; reqP = 75; reqK = 110; }

    // Check if user has entered soil health parameters on profile
    const savedSoil = localStorage.getItem("soil_health_parameters");
    if (savedSoil) {
      try {
        const soilData = JSON.parse(savedSoil);
        const currentN = Number(soilData.nitrogen) || 90;
        const currentP = Number(soilData.phosphorus) || 30;
        const currentK = Number(soilData.potassium) || 50;
        
        const defN = Math.max(0, reqN - currentN);
        const defP = Math.max(0, reqP - currentP);
        const defK = Math.max(0, reqK - currentK);
        
        // Urea: 46% N, DAP: 46% P, MOP: 60% K
        const ureaBags = ((defN / 0.46) / 50).toFixed(1);
        const dapBags = ((defP / 0.46) / 50).toFixed(1);
        const mopBags = ((defK / 0.60) / 50).toFixed(1);
        
        return `Soil Health Deficit: Recommended N:P:K is ${reqN}:${reqP}:${reqK} kg/ha. Soil card shows ${currentN}:${currentP}:${currentK}. Deficit: ${defN}:${defP}:${defK}. Apply ${ureaBags} bags Urea, ${dapBags} bags DAP, and ${mopBags} bags MOP per hectare.`;
      } catch (e) {}
    }

    if (name.includes("rice") || name.includes("paddy")) {
      return "NPK 120:60:60 kg/ha. Apply Nitrogen in 3 splits (sowing, tillering, panicle initiation). Full P and K at sowing.";
    }
    if (name.includes("cotton")) {
      return "NPK 80:40:40 kg/ha. Apply P and K at sowing. Split N into 2 doses at flowering and boll formation.";
    }
    if (name.includes("wheat")) {
      return "NPK 120:50:40 kg/ha. Split Nitrogen: half at sowing, half at crown root initiation (21 days).";
    }
    if (name.includes("groundnut")) {
      return "NPK 20:40:40 kg/ha. Groundnut is a legume; keep N low. Apply Gypsum at pegging stage.";
    }
    return "NPK 100:50:50 kg/ha. Standard split application: half N and full PK at sowing, top dress remaining N at active vegetative stage.";
  };

  const getIrrigationSchedule = (cropName, soilType, weatherObj) => {
    const soil = (soilType || "").toLowerCase();
    let baseInterval = 7;
    let retention = "Moderate water retention.";

    if (soil.includes("black") || soil.includes("clay")) {
      baseInterval = 10;
      retention = "High water holding capacity. Clayey structure preserves deep moisture.";
    } else if (soil.includes("sandy")) {
      baseInterval = 4;
      retention = "Low water holding capacity. Requires frequent light irrigation cycles.";
    }

    let temp = weatherObj ? weatherObj.temperature : 28.0;
    let humidity = weatherObj ? weatherObj.humidity : 70.0;
    
    // Evapotranspiration (ET) heuristic adjustments
    let etFactor = 1.0;
    if (temp > 32) etFactor += 0.25;
    if (humidity < 50) etFactor += 0.15;
    
    let adjustedInterval = Math.max(2, Math.round(baseInterval / etFactor));

    if (weatherObj && weatherObj.rainfall > 4.0) {
      return {
        soilInfo: retention,
        status: `Rain predicted (${weatherObj.rainfall}mm forecast).`,
        advice: "WARNING: Heavy rainfall forecast detected. Delay your scheduled irrigation to conserve water and prevent nutrient leaching."
      };
    }

    const nextIrrig = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    return {
      soilInfo: retention,
      status: `Next irrigation scheduled on ${nextIrrig} (in 2 days).`,
      advice: `Evapotranspiration is high due to ${Math.round(temp)}°C temp and ${Math.round(humidity)}% humidity. Standard interval adjusted from ${baseInterval} to ${adjustedInterval} days to maintain root zone moisture.`
    };
  };

  const getPredictiveYield = (cropName, area, soilType, waterSource, weatherObj) => {
    const cName = (cropName || "").toLowerCase();
    const soil = (soilType || "").toLowerCase();
    const water = (waterSource || "").toLowerCase();
    const farmArea = parseFloat(area) || 1.0;
    
    let baseYieldFactor = 1.5;
    if (cName.includes("rice") || cName.includes("paddy")) baseYieldFactor = 2.2;
    else if (cName.includes("cotton")) baseYieldFactor = 1.2;
    else if (cName.includes("wheat")) baseYieldFactor = 1.8;
    else if (cName.includes("sugarcane")) baseYieldFactor = 32.0;
    else if (cName.includes("groundnut")) baseYieldFactor = 1.0;
    else if (cName.includes("maize")) baseYieldFactor = 2.0;
    
    let soilMult = 1.0;
    if (soil.includes("black") || soil.includes("clay")) {
      soilMult = (cName.includes("rice") || cName.includes("cotton")) ? 1.15 : 1.05;
    } else if (soil.includes("alluvial")) {
      soilMult = 1.2;
    } else if (soil.includes("sandy")) {
      soilMult = cName.includes("groundnut") ? 1.15 : 0.8;
    }
    
    let waterMult = 1.0;
    if (water.includes("canal") || water.includes("borewell")) waterMult = 1.1;
    else if (water.includes("rainfed")) waterMult = 0.75;
    
    let weatherMult = 1.0;
    if (weatherObj) {
      if (weatherObj.rainfall > 0 && weatherObj.rainfall < 40) weatherMult = 1.08;
      else if (weatherObj.rainfall > 80) weatherMult = 0.85;
    }
    
    const predicted = farmArea * baseYieldFactor * soilMult * waterMult * weatherMult;
    return predicted.toFixed(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "100px 20px", textAlign: "center" }}>
          <h2>Loading Crop Details...</h2>
        </div>
        <Footer />
      </>
    );
  }

  if (!crop) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "100px 20px", textAlign: "center" }}>
          <h2>Crop Log Not Found</h2>
          <button className="backBtn" onClick={() => navigate("/crops")}>
            <ArrowLeft size={18} /> Back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const planted = new Date(crop.plantedDate);
  const daysPassed = Math.floor((Date.now() - planted.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassedClamped = Math.max(0, daysPassed);

  const progress = Math.min(100, Math.max(0, Math.round((daysPassedClamped / crop.duration) * 100)));
  const stage = getGrowthStage(crop.cropName, daysPassedClamped, crop.duration);
  const daysLeft = crop.duration - daysPassedClamped;
  const harvestStr = daysLeft > 0 ? `${daysLeft} Days` : "Ready";

  const isFarmer = crop.status === "ACTIVE";

  const calculatedYield = getPredictiveYield(
    crop.cropName,
    farm ? farm.area : 1.0,
    farm ? farm.soilType : "Black Soil",
    farm ? farm.waterSource : "Borewell",
    weather
  );

  const npkAdvice = getNPKRecommendations(crop.cropName, farm ? farm.soilType : "Black Soil");
  const irrigationData = getIrrigationSchedule(crop.cropName, farm ? farm.soilType : "Black Soil", weather);

  // Map Farm coords for leaflet
  const leafletFarm = farm ? {
    name: farm.farmName,
    soil: farm.soilType,
    area: `${farm.area} Acres`,
    water: farm.waterSource,
    village: farm.location ? farm.location.split(" | ")[0] : "Coimbatore",
    state: "Tamil Nadu",
    crop: crop.cropName,
    cropCoordinates: cropCoordinates,
    coordinates: (() => {
      if (farm.location && farm.location.includes(" | ")) {
        try {
          const coords = JSON.parse(farm.location.split(" | ")[1]);
          if (Array.isArray(coords) && coords.length >= 3) return coords;
        } catch (e) {}
      }
      const savedCoordsStr = localStorage.getItem(`farm_coords_${farm.farmId}`);
      if (savedCoordsStr) {
        try {
          return JSON.parse(savedCoordsStr);
        } catch (e) {}
      }
      if (farm.latitude && farm.longitude) {
        const lat = farm.latitude;
        const lng = farm.longitude;
        const d = 0.0006;
        return [
          [lat - d, lng - d],
          [lat + d, lng - d],
          [lat + d, lng + d],
          [lat - d, lng + d]
        ];
      }
      return [];
    })()
  } : null;

  const updateLocalDemoCrops = (updatedCrop) => {
    try {
      const existingStr = localStorage.getItem('demo_crops');
      let list = existingStr ? JSON.parse(existingStr) : [...crops];
      const idx = list.findIndex((c) => c.cropId === updatedCrop.cropId);
      if (idx !== -1) {
        list[idx] = updatedCrop;
      } else {
        list.push(updatedCrop);
      }
      localStorage.setItem('demo_crops', JSON.stringify(list));
    } catch (e) {
      console.error("Failed to persist demo crop state", e);
    }
  };

  const handleHarvestSubmit = async (e) => {
    e.preventDefault();
    if (!harvestYield || isNaN(harvestYield) || Number(harvestYield) <= 0) {
      toast.error("Please enter a valid crop yield (Tons).");
      return;
    }

    const payload = {
      cropName: crop.cropName,
      duration: crop.duration,
      description: "Crop successfully harvested.",
      status: "HARVESTED",
      season: crop.season,
      plantedDate: crop.plantedDate,
      farmId: crop.farmId,
      yield: parseFloat(harvestYield)
    };

    try {
      if (!demoMode) {
        const res = await fetch(`http://localhost:8083/api/crops/${crop.cropId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updated = await res.json();
          updateLocalDemoCrops(updated);
          dispatch(updateCropAction(updated));
          toast.success("Crop harvested successfully in database!");
          setShowHarvestModal(false);
          navigate("/crops");
          return;
        } else {
          toast.error("Failed to harvest crop.");
          return;
        }
      }
    } catch (err) {
      console.warn("Crop service offline, updating locally.", err);
    }

    const updatedCropObj = { ...crop, status: "HARVESTED", yield: parseFloat(harvestYield), description: "Crop successfully harvested." };
    updateLocalDemoCrops(updatedCropObj);
    dispatch(updateCropAction(updatedCropObj));
    toast.success("Crop harvested locally (Demo Mode)!");
    setShowHarvestModal(false);
    navigate("/crops");
  };

  const handleFailCrop = async () => {
    if (!window.confirm("Are you sure you want to mark this crop as FAILED? This will record the crop log as failed in your history.")) return;

    const payload = {
      cropName: crop.cropName,
      duration: crop.duration,
      description: "Crop growth failed due to environment factors.",
      status: "FAILED",
      season: crop.season,
      plantedDate: crop.plantedDate,
      farmId: crop.farmId,
      yield: 0.0
    };

    try {
      if (!demoMode) {
        const res = await fetch(`http://localhost:8083/api/crops/${crop.cropId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updated = await res.json();
          updateLocalDemoCrops(updated);
          dispatch(updateCropAction(updated));
          toast.success("Crop status updated to FAILED in database.");
          navigate("/crops");
          return;
        }
      }
    } catch (err) {
      console.warn("Crop service offline, failing locally.", err);
    }

    const updatedCropObj = { ...crop, status: "FAILED", yield: 0.0, description: "Crop growth failed due to environment factors." };
    updateLocalDemoCrops(updatedCropObj);
    dispatch(updateCropAction(updatedCropObj));
    toast.success("Crop marked failed locally (Demo Mode)!");
    navigate("/crops");
  };

  return (
    <>
      <Navbar />

      <div className="cropDetailsPage">
        {/* Header */}
        <div className="detailsHeader">
          <button className="backBtn" onClick={() => navigate("/crops")}>
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* Hero */}
        <div className="cropDetailsHero">
          <img
            src={
              (crop.cropName || "").toLowerCase().includes("rice")
                ? "https://images.pexels.com/photos/236474/pexels-photo-236474.jpeg"
                : (crop.cropName || "").toLowerCase().includes("cotton")
                ? "https://images.pexels.com/photos/13924871/pexels-photo-13924871.jpeg"
                : (crop.cropName || "").toLowerCase().includes("groundnut")
                ? "https://images.pexels.com/photos/9799037/pexels-photo-9799037.jpeg"
                : "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg"
            }
            alt={crop.cropName}
            className="heroImage"
          />

          <div className="heroContent">
            <span className={`heroBadge ${crop.status.toLowerCase()}`}>{crop.status}</span>
            <h1>{crop.cropName}</h1>
            <p>
              {farm ? farm.farmName : "Registered Plot"} • {stage}
            </p>
          </div>
        </div>
        <br />

        {/* Summary */}
        <div className="detailsStats">
          <div className="detailsCard">
            <Leaf />
            <h3>Health Status</h3>
            <h2>{crop.status === "FAILED" ? "0%" : "92%"}</h2>
          </div>

          <div className="detailsCard">
            <TrendingUp />
            <h3>Yield</h3>
            <h2>{crop.status === "HARVESTED" ? `${crop.yield} Tons` : `${calculatedYield} Tons (Est)`}</h2>
          </div>

          <div className="detailsCard">
            <Calendar />
            <h3>Harvest Countdown</h3>
            <h2>{crop.status === "ACTIVE" ? harvestStr : "N/A"}</h2>
          </div>

          <div className="detailsCard">
            <Droplets />
            <h3>Soil Moisture</h3>
            <h2>{crop.status === "FAILED" ? "20%" : "68%"}</h2>
          </div>
        </div>

        {/* Main Grid */}
        <div className="detailsGrid">
          {/* Left */}
          <div>
            {/* Progress */}
            <div className="glassCard">
              <h2>Growth Progress</h2>
              <div className="progressBar">
                <div className="progressFill" style={{ width: `${progress}%` }}></div>
              </div>
              <p>
                {stage} • {progress}%
              </p>
            </div>

            {/* Weather */}
            <div className="glassCard">
              <h2>Weather Snapshot</h2>
              {weather ? (
                <div className="weatherRow">
                  <div>
                    <Sun />
                    <h4>{Math.round(weather.temperature)}°C</h4>
                    <span>Temperature</span>
                  </div>
                  <div>
                    <CloudRain />
                    <span>Rainfall</span>
                    <h4>{weather.rainfall || 0} mm</h4>
                  </div>
                  <div>
                    <Droplets />
                    <h4>{weather.humidity}%</h4>
                    <span>Humidity</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: "gray", fontSize: "13px" }}>No weather snapshot. Register farm coordinates to retrieve live climate stats.</p>
              )}
            </div>

            {/* Map */}
            <div className="glassCard">
              <h2>Crop Location Map</h2>
              {leafletFarm && leafletFarm.coordinates.length > 0 ? (
                <LeafletViewer farm={leafletFarm} />
              ) : (
                <div className="leafletPlaceholder">
                  <MapPinned size={50} />
                  <h3>Leaflet Map</h3>
                  <p>Interactive crop location map is currently loading or unavailable.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div>
            {/* AI */}
            <div className="glassCard">
              <h2>
                <Brain size={22} />
                AI Crop Advice & Recommendations
              </h2>
              <div className="recommendationBox">
                <strong>NPK Recommendations:</strong>
                <p style={{ margin: "5px 0 15px 0", fontSize: "13px", lineHeight: "1.4" }}>{npkAdvice}</p>
                <strong>Irrigation Advice:</strong>
                <p style={{ margin: "5px 0 0 0", fontSize: "13px", lineHeight: "1.4" }}>
                  {irrigationData.status} {irrigationData.advice}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="glassCard">
              <h2>
                <Sprout size={22} />
                Growth Timeline
              </h2>
              <div className="timeline">
                <div className="timelineItem">
                  <span className={`dot ${progress >= 0 ? "active" : ""}`}></span>
                  Seeded ({new Date(crop.plantedDate).toLocaleDateString()})
                </div>
                <div className="timelineItem">
                  <span className={`dot ${progress >= 20 ? "active" : ""}`}></span>
                  Germination
                </div>
                <div className="timelineItem">
                  <span className={`dot ${progress >= 50 ? "active" : ""}`}></span>
                  Vegetative
                </div>
                <div className="timelineItem">
                  <span className={`dot ${progress >= 75 ? "active" : ""}`}></span>
                  Flowering
                </div>
                <div className="timelineItem">
                  <span className={`dot ${progress >= 100 || crop.status === "HARVESTED" ? "active" : ""}`}></span>
                  Expected Harvest ({new Date(crop.expectedHarvestDate).toLocaleDateString()})
                </div>
              </div>
            </div>

            {/* Crop Actions */}
            {crop.status === "ACTIVE" && (
              <div className="glassCard">
                <h2>Manage Crop Cultivation</h2>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button
                    className="submitBtn"
                    style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", borderRadius: "8px" }}
                    onClick={() => setShowHarvestModal(true)}
                  >
                    <CheckCircle size={18} />
                    Harvest Crop
                  </button>
                  <button
                    className="cancelBtn"
                    style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", borderRadius: "8px", background: "#fff", border: "1px solid #dc2626", color: "#dc2626" }}
                    onClick={handleFailCrop}
                  >
                    <XCircle size={18} />
                    Mark Failed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Harvest Yield Modal */}
        {showHarvestModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}
          >
            <div style={{ background: "#ffffff", padding: "30px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
              <h3 style={{ margin: "0 0 15px 0" }}>Harvest Crop Log</h3>
              <p style={{ fontSize: "13px", color: "gray", margin: "0 0 20px 0" }}>
                Enter the final harvested quantity in Tons for <strong>{crop.cropName}</strong>. This details the seasonal crop records history.
              </p>
              <form onSubmit={handleHarvestSubmit}>
                <div className="formGroup" style={{ marginBottom: "20px" }}>
                  <label>Harvest Yield (Tons)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 3.5"
                    value={harvestYield}
                    onChange={(e) => setHarvestYield(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", border: "1px solid #cbdcd0", borderRadius: "8px", marginTop: "5px" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="cancelBtn"
                    style={{ padding: "8px 16px" }}
                    onClick={() => setShowHarvestModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submitBtn" style={{ padding: "8px 16px" }}>
                    Record Harvest
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <FloatingAI />
      <Footer />
    </>
  );
}