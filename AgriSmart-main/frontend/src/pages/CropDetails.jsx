import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import "../styles/sid.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";
import LeafletViewer from "../components/LeafletViewer";
import { aiApi } from "../services/api";
import * as turf from "@turf/turf";

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
  const user = useSelector((state) => state.agri.user);

  const [harvestYield, setHarvestYield] = useState("");
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  // Mark crop as failed modal state
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReasonSelect, setFailReasonSelect] = useState("Pest Infestation / Bollworm");
  const [failReasonOther, setFailReasonOther] = useState("");

  const cropIdNum = Number(id);
  const [loading, setLoading] = useState(true);
  const [fetchedCrop, setFetchedCrop] = useState(null);
  const [aiAdvisory, setAiAdvisory] = useState(null);
  const [showFertilizerTech, setShowFertilizerTech] = useState(false);
  const [showIrrigationTech, setShowIrrigationTech] = useState(false);

  useEffect(() => {
    if (fetchedCrop || cropIdNum) {
      const c = fetchedCrop || crops.find((item) => item.cropId === cropIdNum);
      if (c && token && !demoMode) {
        aiApi.getRecommendation(token, c.farmId || 1, c.cropId)
          .then((res) => { if (res) setAiAdvisory(res); })
          .catch((err) => console.warn("AI Advisory service offline", err));
      }
    }
  }, [fetchedCrop, cropIdNum, token, demoMode, crops]);

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

  // Calculate exact crop planted area from API area field, description, or turf polygon
  const cropPlantedArea = (() => {
    if (crop && crop.area && Number(crop.area) > 0) return Number(crop.area);
    if (crop && crop.description) {
      const match = crop.description.match(/Area:\s*([\d.]+)/i) || crop.description.match(/Cultivated Area:\s*([\d.]+)/i);
      if (match && match[1]) return Number(match[1]);
    }
    if (cropCoordinates && cropCoordinates.length >= 3) {
      try {
        const poly = turf.polygon([cropCoordinates.map(p => [p[1], p[0]]).concat([[cropCoordinates[0][1], cropCoordinates[0][0]]])]);
        const sqm = turf.area(poly);
        const acres = sqm * 0.000247105;
        if (acres > 0) return Number(acres.toFixed(2));
      } catch (e) {}
    }
    return 1.0;
  })();

  const totalFarmArea = farm && farm.area ? Number(farm.area) : 13.08;
  const plantedAreaDisplay = `${cropPlantedArea} / ${totalFarmArea} Acres`;

  const calculatedYield = getPredictiveYield(
    crop.cropName,
    cropPlantedArea,
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
    cropPlantedArea: `${cropPlantedArea} Acres`,
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

  const handleFailCropSubmit = async (e) => {
    e.preventDefault();
    const finalReason = failReasonSelect === "Other Reasons" ? (failReasonOther || "Unspecified cause") : failReasonSelect;
    const descText = `Failed: ${finalReason}`;

    const payload = {
      cropName: crop.cropName,
      duration: crop.duration,
      description: descText,
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
          toast.success(`Crop status updated to FAILED (${finalReason})`);
          setShowFailModal(false);
          navigate("/crops");
          return;
        }
      }
    } catch (err) {
      console.warn("Crop service offline, failing locally.", err);
    }

    const updatedCropObj = { ...crop, status: "FAILED", yield: 0.0, description: descText };
    updateLocalDemoCrops(updatedCropObj);
    dispatch(updateCropAction(updatedCropObj));
    toast.success(`Crop marked failed locally (${finalReason})!`);
    setShowFailModal(false);
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

        {/* Failed Crop Reason Banner */}
        {crop.status === "FAILED" && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 14, padding: "16px 20px", marginBottom: 20, color: "#991b1b" }}>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              <XCircle size={18} /> Crop Marked As Failed
            </h4>
            <p style={{ margin: "6px 0 0", fontSize: 14 }}>
              <strong>Recorded Failure Reason:</strong> {crop.description ? crop.description.replace(/^Failed:\s*/, '') : "Environmental / Unspecified factors"}
            </p>
          </div>
        )}

        {/* Summary Metrics */}
        <div className="detailsStats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="detailsCard">
            <Sprout />
            <h3>Planted Area</h3>
            <h2>{plantedAreaDisplay}</h2>
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
            {/* AI Recommendations */}
            <div className="glassCard" style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, color: "#1e293b", margin: "0 0 16px" }}>
                <Brain size={22} style={{ color: "#16a34a" }} />
                AI Crop Advice & Recommendations
              </h2>

              {/* FERTILIZER SECTION */}
              <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <h4 style={{ color: "#15803d", fontSize: 15, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  🌱 Fertilizer Recommendation
                </h4>

                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "#1e293b", display: "flex", flexDirection: "column", gap: 8 }}>
                  <li><strong>What fertilizer to apply:</strong> Urea & DAP</li>
                  <li><strong>Quantity:</strong> {(((120 - (user?.nitrogen || 60)) / 0.46) / 50).toFixed(1)} bags Urea, {(((60 - (user?.phosphorus || 40)) / 0.46) / 50).toFixed(1)} bags DAP per hectare</li>
                  <li><strong>Target crop:</strong> {crop.cropName}</li>
                  <li><strong>When to apply:</strong> Top-dress Urea during active tillering stage (within 5 days). Apply DAP at sowing.</li>
                  <li><strong>Simple reason:</strong> Boosts leaf growth and green canopy establishment in {farm ? farm.soilType : "Loamy Soil"}.</li>
                </ul>

                {aiAdvisory && aiAdvisory.fertilizerRecommendation && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#15803d", fontWeight: 700, background: "#ffffff", padding: "8px 12px", borderRadius: 8, border: "1px solid #86efac" }}>
                    CatBoost AI Model Output: {aiAdvisory.fertilizerRecommendation}
                  </div>
                )}

                <div style={{ textAlign: "right", marginTop: 10 }}>
                  <button
                    onClick={() => setShowFertilizerTech(!showFertilizerTech)}
                    style={{ background: "none", border: "none", color: "#16a34a", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  >
                    {showFertilizerTech ? "▲ Hide Technical Details" : "▼ View Technical NPK Calculations"}
                  </button>
                  {showFertilizerTech && (
                    <div style={{ marginTop: 8, padding: 10, background: "#ffffff", borderRadius: 8, fontSize: 12, color: "#475569", border: "1px solid #d1fae5", textAlign: "left" }}>
                      • Soil Card Readings: N={user?.nitrogen || 60} kg/ha, P={user?.phosphorus || 40} kg/ha, K={user?.potassium || 50} kg/ha (pH {user?.soilPh || 6.5})<br />
                      • Crop Standard Target ({crop.cropName}): NPK 120:60:60 kg/ha<br />
                      • Computed Deficit: N={Math.max(0, 120 - (user?.nitrogen || 60))} kg, P={Math.max(0, 60 - (user?.phosphorus || 40))} kg, K={Math.max(0, 60 - (user?.potassium || 50))} kg
                    </div>
                  )}
                </div>
              </div>

              {/* IRRIGATION SECTION */}
              <div style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: 14, padding: 16 }}>
                <h4 style={{ color: "#0369a1", fontSize: 15, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  💧 Irrigation Schedule
                </h4>

                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "#1e293b", display: "flex", flexDirection: "column", gap: 8 }}>
                  <li><strong>Recommended date/time:</strong> Tomorrow at 07:00 AM</li>
                  <li><strong>Amount/depth:</strong> 2.5 cm depth via Drip / Furrow Irrigation</li>
                  <li><strong>Current soil moisture:</strong> 68% (Adequate Root Zone Capacity)</li>
                  <li><strong>Rainfall & weather:</strong> {weather ? `${Math.round(weather.temperature)}°C · Humidity ${weather.humidity}% · Rain ${weather.rainfall || 0}mm` : "0 mm Rain · Normal"}</li>
                  <li><strong>Action instruction:</strong> Water in early morning hours to minimize surface evapotranspiration.</li>
                </ul>

                {aiAdvisory && aiAdvisory.irrigationRecommendation && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#0369a1", fontWeight: 700, background: "#ffffff", padding: "8px 12px", borderRadius: 8, border: "1px solid #7dd3fc" }}>
                    CatBoost AI Model Output: {aiAdvisory.irrigationRecommendation}
                  </div>
                )}

                <div style={{ textAlign: "right", marginTop: 10 }}>
                  <button
                    onClick={() => setShowIrrigationTech(!showIrrigationTech)}
                    style={{ background: "none", border: "none", color: "#0284c7", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                  >
                    {showIrrigationTech ? "▲ Hide Technical Details" : "▼ View Hydrological & Evapotranspiration Details"}
                  </button>
                  {showIrrigationTech && (
                    <div style={{ marginTop: 8, padding: 10, background: "#ffffff", borderRadius: 8, fontSize: 12, color: "#475569", border: "1px solid #e0f2fe", textAlign: "left" }}>
                      • Soil Retention Structure: {farm && farm.soilType ? farm.soilType : "Loamy Soil"}<br />
                      • Base Irrigation Interval: 7 Days (Adjusted ET Factor: 1.15)<br />
                      • Evapotranspiration Rate: High temperature ({weather ? Math.round(weather.temperature) : 28}°C) accelerates water loss.
                    </div>
                  )}
                </div>
              </div>

              {aiAdvisory && aiAdvisory.cropAdvice && (
                <div style={{ marginTop: 12, padding: 10, background: "#f8fafc", borderRadius: 8, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                  💡 {aiAdvisory.cropAdvice}
                </div>
              )}
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
                    onClick={() => setShowFailModal(true)}
                  >
                    <XCircle size={18} />
                    Mark Failed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mark Crop Failed Modal */}
        {showFailModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16
            }}
          >
            <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", width: "450px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#991b1b", fontSize: 18, display: "flex", alignItems: "center", gap: 6 }}>
                <XCircle size={20} /> Mark Crop Cultivation As Failed
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 18px 0", lineHeight: 1.4 }}>
                Please specify the primary reason for crop loss for <strong>{crop.cropName}</strong>. This data will be logged permanently in your historical failed crop records.
              </p>
              <form onSubmit={handleFailCropSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Select Failure Reason *
                  </label>
                  <select
                    value={failReasonSelect}
                    onChange={(e) => setFailReasonSelect(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbdcd0", fontSize: 14, background: "#fff" }}
                  >
                    <option value="Pest Infestation / Bollworm Attack">Pest Infestation / Bollworm Attack</option>
                    <option value="Drought / Severe Water Deficit">Drought / Severe Water Deficit</option>
                    <option value="Excess Rain / Waterlogging & Flood">Excess Rain / Waterlogging & Flood</option>
                    <option value="Fungal / Bacterial Crop Disease">Fungal / Bacterial Crop Disease</option>
                    <option value="Soil Salinity / Severe Nutrient Deficiency">Soil Salinity / Severe Nutrient Deficiency</option>
                    <option value="Unexpected Weather / Frost / Hailstorm">Unexpected Weather / Frost / Hailstorm</option>
                    <option value="Other Reasons">Other Reasons (Specify Below)</option>
                  </select>
                </div>

                {failReasonSelect === "Other Reasons" && (
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      Specify Failure Reason *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Describe the cause of crop failure..."
                      value={failReasonOther}
                      onChange={(e) => setFailReasonOther(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbdcd0", fontSize: 14 }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: 10 }}>
                  <button
                    type="button"
                    className="cancelBtn"
                    style={{ padding: "10px 16px", borderRadius: 8 }}
                    onClick={() => setShowFailModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                  >
                    Record Crop Failure
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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