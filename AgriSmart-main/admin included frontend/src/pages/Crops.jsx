import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../styles/sid.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";

import {
  Search,
  Plus,
  Leaf,
  Sprout,
  Calendar,
  TrendingUp,
  MapPinned,
  ArrowRight,
  CircleCheck,
} from "lucide-react";

export default function Crops() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // 'active', 'harvested', 'failed', 'all'

  const crops = useSelector((state) => state.agri.crops) || [];
  const farms = useSelector((state) => state.agri.farms) || [];

  const cropImages = {
    rice: "https://images.pexels.com/photos/236474/pexels-photo-236474.jpeg",
    paddy: "https://images.pexels.com/photos/236474/pexels-photo-236474.jpeg",
    cotton: "https://images.pexels.com/photos/13924871/pexels-photo-13924871.jpeg",
    groundnut: "https://images.pexels.com/photos/9799037/pexels-photo-9799037.jpeg",
    peanut: "https://images.pexels.com/photos/9799037/pexels-photo-9799037.jpeg",
    maize: "https://images.pexels.com/photos/7878030/pexels-photo-7878030.jpeg",
    wheat: "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg",
  };

  const getCropImage = (name) => {
    const key = (name || "").toLowerCase();
    for (const [k, v] of Object.entries(cropImages)) {
      if (key.includes(k)) return v;
    }
    return "https://images.pexels.com/photos/29294526/pexels-photo-29294526.jpeg"; // default fallback
  };

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

  const getGrowthStage = (c) => {
    if (c.status === "HARVESTED") return "Crop Harvested";
    if (c.status === "FAILED") return "Crop Failed";

    const planted = new Date(c.plantedDate);
    const daysPassed = Math.floor((Date.now() - planted.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassedClamped = Math.max(0, daysPassed);

    if ((c.cropName || "").toLowerCase().includes("rice") || (c.cropName || "").toLowerCase().includes("paddy")) {
      return getRiceGrowthStage(daysPassedClamped);
    }
    return getGeneralGrowthStage(daysPassedClamped, c.duration);
  };

  // Compile full crop list data dynamically
  const cropsList = crops.map((c) => {
    const farm = farms.find((f) => f.farmId === c.farmId);
    const farmName = farm ? farm.farmName : "Registered Plot";
    const farmArea = farm ? `${farm.area} Acres` : "N/A";

    const planted = new Date(c.plantedDate);
    const daysPassed = Math.floor((Date.now() - planted.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassedClamped = Math.max(0, daysPassed);

    let progress = 100;
    let harvestStr = "N/A";

    if (c.status === "ACTIVE") {
      progress = Math.min(100, Math.max(0, Math.round((daysPassedClamped / c.duration) * 100)));
      const daysLeft = c.duration - daysPassedClamped;
      harvestStr = daysLeft > 0 ? `${daysLeft} Days` : "Ready";
    } else if (c.status === "HARVESTED") {
      progress = 100;
      harvestStr = "Harvested";
    } else if (c.status === "FAILED") {
      progress = 0;
      harvestStr = "Failed";
    }

    const stage = getGrowthStage(c);

    return {
      id: c.cropId,
      name: c.cropName,
      image: getCropImage(c.cropName),
      farm: farmName,
      status: c.status || "ACTIVE",
      health: c.status === "FAILED" ? "Failed" : c.status === "HARVESTED" ? "Harvested" : "Healthy",
      progress,
      stage,
      area: farmArea,
      harvest: harvestStr,
      yield: c.yield ? `${c.yield} Tons` : "N/A"
    };
  });

  // Filter by active tab & search query
  const filteredCrops = cropsList.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.farm.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "active") return crop.status === "ACTIVE";
    if (activeTab === "harvested") return crop.status === "HARVESTED";
    if (activeTab === "failed") return crop.status === "FAILED";
    return true; // 'all'
  });

  // Summary Metrics
  const activeCount = crops.filter((c) => c.status === "ACTIVE").length;
  const harvestedCount = crops.filter((c) => c.status === "HARVESTED").length;
  const failedCount = crops.filter((c) => c.status === "FAILED").length;
  const healthyCount = cropsList.filter((c) => c.health === "Healthy").length;

  const harvestLefts = crops.filter((c) => c.status === "ACTIVE").map((c) => {
    const days = c.duration - Math.floor((Date.now() - new Date(c.plantedDate).getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  });
  const nextHarvestStr = harvestLefts.length > 0 ? `${Math.min(...harvestLefts)} Days` : "N/A";

  // Calculate average yield from historical harvested crops
  const completedCrops = crops.filter((c) => c.status === "HARVESTED");
  const totalYield = completedCrops.reduce((acc, c) => acc + (c.yield || 0), 0);
  const avgYieldStr = completedCrops.length > 0 ? `${(totalYield / completedCrops.length).toFixed(1)} Tons` : "0.0 Tons";

  return (
    <>
      <Navbar />

      <div className="cropPage">
        {/* HERO */}
        <section className="cropHero">
          <div className="cropHeader">
            <div className="cropHeaderLeft">
              <h1>Crop Management</h1>
              <p>Monitor active crops, review seasonal harvest logs, and manage yield performance.</p>
            </div>
            <button className="addCropBtn" onClick={() => navigate("/crops/add")}>
              <Plus size={18} />
              Add Crop
            </button>
          </div>
        </section>

        {/* CONTENT */}
        <section className="cropContent">
          {/* SUMMARY CARD */}
          <div className="summaryCard">
            <div className="summaryItem">
              <Leaf size={34} />
              <div>
                <span>Active Crops</span>
                <h3>{activeCount}</h3>
              </div>
            </div>
            <div className="summaryDivider"></div>
            <div className="summaryItem">
              <CircleCheck size={34} />
              <div>
                <span>Healthy Crops</span>
                <h3>{healthyCount}</h3>
              </div>
            </div>
            <div className="summaryDivider"></div>
            <div className="summaryItem">
              <Calendar size={34} />
              <div>
                <span>Next Harvest</span>
                <h3>{nextHarvestStr}</h3>
              </div>
            </div>
            <div className="summaryDivider"></div>
            <div className="summaryItem">
              <TrendingUp size={34} />
              <div>
                <span>Average Yield</span>
                <h3>{avgYieldStr}</h3>
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
            <div className="searchBar" style={{ flex: 1, minWidth: "260px", margin: 0 }}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search crops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* TAB BUTTONS */}
            <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
              <button
                onClick={() => setActiveTab("active")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  background: activeTab === "active" ? "var(--primary, #15803d)" : "transparent",
                  color: activeTab === "active" ? "#ffffff" : "#64748b",
                  transition: "all 0.2s"
                }}
              >
                Active ({activeCount})
              </button>

              <button
                onClick={() => setActiveTab("harvested")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  background: activeTab === "harvested" ? "var(--primary, #15803d)" : "transparent",
                  color: activeTab === "harvested" ? "#ffffff" : "#64748b",
                  transition: "all 0.2s"
                }}
              >
                Harvested ({harvestedCount})
              </button>

              {failedCount > 0 && (
                <button
                  onClick={() => setActiveTab("failed")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "13.5px",
                    cursor: "pointer",
                    background: activeTab === "failed" ? "#dc2626" : "transparent",
                    color: activeTab === "failed" ? "#ffffff" : "#64748b",
                    transition: "all 0.2s"
                  }}
                >
                  Failed ({failedCount})
                </button>
              )}

              <button
                onClick={() => setActiveTab("all")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  background: activeTab === "all" ? "var(--primary, #15803d)" : "transparent",
                  color: activeTab === "all" ? "#ffffff" : "#64748b",
                  transition: "all 0.2s"
                }}
              >
                All Crops ({crops.length})
              </button>
            </div>
          </div>

          {/* SECTION TITLE */}
          <div className="sectionTitle">
            <h2>
              {activeTab === "active" && "Current Active Crops"}
              {activeTab === "harvested" && "Harvested Crops History"}
              {activeTab === "failed" && "Failed Crops Records"}
              {activeTab === "all" && "All Crop Cultivation Records"}
            </h2>
          </div>

          <div className="cropGrid">
            {filteredCrops.length > 0 ? (
              filteredCrops.map((crop) => (
                <div className="cropCard" key={crop.id}>
                  <img src={crop.image} alt={crop.name} className="cropImage" />
                  <div className="cropBody">
                    <div className="cropTop">
                      <div>
                        <h2>{crop.name}</h2>
                        <p>{crop.stage}</p>
                      </div>
                      <span
                        className={`cropStatus ${
                          crop.status === "HARVESTED"
                            ? "healthy"
                            : crop.status === "FAILED"
                            ? "attention"
                            : crop.health.toLowerCase()
                        }`}
                        style={{
                          background: crop.status === "HARVESTED" ? "#dcfce7" : "",
                          color: crop.status === "HARVESTED" ? "#15803d" : ""
                        }}
                      >
                        {crop.status}
                      </span>
                    </div>

                    <div className="progressSection">
                      <div className="progressHeader">
                        <span>
                          {crop.status === "HARVESTED"
                            ? `Yield: ${crop.yield}`
                            : crop.status === "FAILED"
                            ? "Crop Failed"
                            : "Growth Progress"}
                        </span>
                        <span>{crop.progress}%</span>
                      </div>
                      <div className="progressBar">
                        <div
                          className="progressFill"
                          style={{
                            width: `${crop.progress}%`,
                            backgroundColor:
                              crop.status === "HARVESTED"
                                ? "#16a34a"
                                : crop.status === "FAILED"
                                ? "#dc2626"
                                : ""
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="cropInfo">
                      <div>
                        <MapPinned size={18} />
                        <span>{crop.farm}</span>
                      </div>
                      <div>
                        <Sprout size={18} />
                        <span>{crop.area}</span>
                      </div>
                      <div>
                        <Calendar size={18} />
                        <span>{crop.status === "HARVESTED" ? `Yield: ${crop.yield}` : crop.harvest}</span>
                      </div>
                    </div>

                    <button
                      className="detailsBtn"
                      onClick={() => navigate(`/crops/${crop.id}`)}
                    >
                      View Details
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="emptyCrop">
                <Leaf size={70} />
                <h2>No Crops Found</h2>
                <p>
                  {activeTab === "harvested"
                    ? "No crops have been marked as harvested yet."
                    : activeTab === "failed"
                    ? "No failed crops recorded."
                    : "You haven't added any crops matching this filter."}
                </p>
                {activeTab === "active" && (
                  <button className="addCropBtn" onClick={() => navigate("/crops/add")}>
                    <Plus size={18} />
                    Add Crop
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <FloatingAI />
      <Footer />
    </>
  );
}