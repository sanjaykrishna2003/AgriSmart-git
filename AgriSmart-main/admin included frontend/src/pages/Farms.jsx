import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setFarms } from "../main";
import "../styles/farm.css";

import Footer from "../components/Footer";

import {
  FaPlus,
  FaSearch,
  FaArrowRight,
  FaWarehouse,
  FaLeaf,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaChartLine
} from "react-icons/fa";

export default function Farms() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];

  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);

  // =========================
  // LOAD FARMS
  // =========================
  useEffect(() => {
    const loadFarms = async () => {
      if (!demoMode && token) {
        try {
          const res = await fetch(
            "http://localhost:8082/api/farms",
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (res.ok) {
            const data = await res.json();

            const farmList = data.content || data || [];

            dispatch(setFarms(farmList));
          }
        } catch (e) {
          console.warn("Failed to fetch farms on mount", e);
        }
      }
    };

    loadFarms();
  }, [token, demoMode, dispatch]);

  // =========================
  // GET CROPS FOR FARM
  // =========================
  const getCropsForFarm = (farmId) => {
    const list = crops
      .filter(
        (c) =>
          c.farmId === farmId &&
          c.status === "ACTIVE"
      )
      .map((c) => c.cropName);

    return list.length > 0 ? list.join(", ") : "None";
  };

  // =========================
  // FARM IMAGE
  // =========================
  const getFarmImage = (soilType) => {
    const soil = (soilType || "").toLowerCase();

    if (soil.includes("red")) {
      return "https://images.pexels.com/photos/33669658/pexels-photo-33669658.jpeg";
    }

    if (soil.includes("sandy")) {
      return "https://images.pexels.com/photos/37838036/pexels-photo-37838036.jpeg";
    }

    return "https://images.pexels.com/photos/29294526/pexels-photo-29294526.jpeg";
  };

  // =========================
  // SEARCH
  // =========================
  const filteredFarms = farms.filter((farm) => {
    const name = farm.farmName
      ? farm.farmName.toLowerCase()
      : "";

    const location = farm.location
      ? farm.location.toLowerCase()
      : "";

    const soil = farm.soilType
      ? farm.soilType.toLowerCase()
      : "";

    const query = search.toLowerCase();

    return (
      name.includes(query) ||
      location.includes(query) ||
      soil.includes(query)
    );
  });

  // =========================
  // STATISTICS
  // =========================
  const totalArea = farms.reduce(
    (acc, farm) => acc + (Number(farm.area) || 0),
    0
  );

  const activeCropsCount = crops.filter(
    (crop) => crop.status === "ACTIVE"
  ).length;

  // =========================
  // PAGE
  // =========================
  return (
    <>
      <div className="farmPage">

        {/* ================= HERO ================= */}
        <section className="farmHero">
          <div className="farmHeroOverlay">

            <div className="farmHeroLeft">
              <h1>Farm Management</h1>

              <p>
                Register, monitor and manage all your
                agricultural lands in one place.
              </p>
            </div>

            <button
              className="farmAddBtn"
              onClick={() =>
                navigate("/farm-management/add")
              }
            >
              <FaPlus />
              Add Farm
            </button>

          </div>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="farmContainer">

          {/* ================= SUMMARY ================= */}
          <div className="farmStats">

            <div className="farmStatCard">
              <FaWarehouse />

              <div>
                <span>Registered Farms</span>
                <h2>{farms.length}</h2>
              </div>
            </div>

            <div className="farmStatCard">
              <FaRulerCombined />

              <div>
                <span>Total Area</span>
                <h2>
                  {totalArea.toFixed(1)} Acres
                </h2>
              </div>
            </div>

            <div className="farmStatCard">
              <FaLeaf />

              <div>
                <span>Active Crops</span>
                <h2>{activeCropsCount}</h2>
              </div>
            </div>

            <div className="farmStatCard">
              <FaChartLine />

              <div>
                <span>Average Yield</span>
                <h2>3.6 Tons</h2>
              </div>
            </div>

          </div>

          {/* ================= SEARCH ================= */}
          <div className="farmSearch">

            <FaSearch />

            <input
              type="text"
              placeholder="Search your farms..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          {/* ================= TITLE ================= */}
          <div className="farmTitle">

            <div>
              <h2>My Farms</h2>

              <p>
                Manage every farm registered in
                AgriSmart.
              </p>
            </div>

          </div>

          {/* ================= FARM LIST ================= */}
          <div className="farmList">

            {filteredFarms.length > 0 ? (

              filteredFarms.map((farm) => (

                <div
                  className="farmCard"
                  key={farm.farmId}
                >

                  {/* ================= IMAGE ================= */}
                  <div className="farmCardImage">

                    <img
                      src={getFarmImage(
                        farm.soilType
                      )}
                      alt={farm.farmName}
                    />

                  </div>

                  {/* ================= DETAILS ================= */}
                  <div className="farmCardContent">

                    {/* ================= TOP ================= */}
                    <div className="farmCardTop">

                      <div>

                        <h3>
                          {farm.farmName}
                        </h3>

                        <p>
                          <FaMapMarkerAlt />

                          {farm.location
                            ? farm.location.split(
                                " | "
                              )[0]
                            : ""}
                        </p>

                      </div>

                      {/* ================= BUTTONS ================= */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap"
                        }}
                      >

                        {/* VIEW FARM */}
                        <button
                          className="farmViewBtn"
                          onClick={() =>
                            navigate(
                              `/farm-management/${farm.farmId}`
                            )
                          }
                        >
                          View Farm
                          <FaArrowRight />
                        </button>

                        {/* AI RECOMMENDATION */}
                        <button
                            className="farmAIButton"
                            onClick={() =>
                              navigate(`/farm-management/${farm.farmId}/ai`)
                            }
                          >
                            🤖 AI Recommendation
                          </button>

                      </div>

                    </div>

                    {/* ================= FARM INFO ================= */}
                    <div className="farmInfoGrid">

                      <div className="farmInfoBox">

                        <span>Soil Type</span>

                        <h4>
                          {farm.soilType}
                        </h4>

                      </div>

                      <div className="farmInfoBox">

                        <span>Area</span>

                        <h4>
                          {farm.area} Acres
                        </h4>

                      </div>

                      <div className="farmInfoBox">

                        <span>Crops</span>

                        <h4>
                          {getCropsForFarm(
                            farm.farmId
                          )}
                        </h4>

                      </div>

                    </div>

                  </div>

                </div>

              ))

            ) : (

              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  width: "100%",
                  color: "gray"
                }}
              >
                <p>
                  No farms matching search criteria
                  or registered yet.
                </p>
              </div>

            )}

          </div>

        </section>

      </div>

      <Footer />
    </>
  );
}