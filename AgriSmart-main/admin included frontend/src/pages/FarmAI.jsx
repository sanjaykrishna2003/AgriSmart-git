import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function FarmAI() {

  const { id } = useParams();
  const navigate = useNavigate();

  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];

  const token = useSelector((state) => state.agri.token);

  // Find selected farm
  const farm = farms.find(
    (f) => String(f.farmId) === String(id)
  );

  // Find active crop belonging to this farm
  const farmCrop = crops.find(
    (c) =>
      String(c.farmId) === String(id) &&
      c.status === "ACTIVE"
  );

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");

  const getRecommendation = async () => {
  if (!farm) {
    setError("Farm information not available.");
    return;
  }

  setLoading(true);
  setError("");
  setRecommendation(null);

  try {
    const requestBody = {
      farmId: farm.farmId,
      farmName: farm.farmName || "",
      soilType: farm.soilType || "",
      area: farm.area || 0,
      location: farm.location || "",
      cropName: farmCrop?.cropName || ""
    };

    console.log("Sending AI request:", requestBody);

    const response = await fetch(
      "http://localhost:8086/api/ai/recommendation",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`
              }
            : {})
        },

        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI service returned ${response.status}`
      );
    }

    const data = await response.json();

    console.log("AI response:", data);

    setRecommendation(data);

  } catch (error) {

    console.error("AI recommendation error:", error);

    setError(
      "Unable to get AI recommendation. Please make sure the AI service is running."
    );

  } finally {

    setLoading(false);

  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f8f4",
        padding: "40px"
      }}
    >

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate("/farm-management")}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "16px"
          }}
        >
          ← Back to My Farms
        </button>


        {/* HEADER */}

        <h1>
          🤖 AI Farm Advisory
        </h1>

        <p>
          Get intelligent fertilizer and irrigation
          recommendations for your farm.
        </p>


        {/* FARM INFORMATION */}

        {farm ? (

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "15px",
              marginTop: "25px",
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.08)"
            }}
          >

            <h2>
              {farm.farmName}
            </h2>

            <p>
              📍 {farm.location}
            </p>

            <p>
              🌱 Soil: {farm.soilType}
            </p>

            <p>
              📐 Area: {farm.area} Acres
            </p>

            <p>
              🌾 Crop:{" "}
              {farmCrop
                ? farmCrop.cropName
                : "No active crop"}
            </p>

          </div>

        ) : (

          <div
            style={{
              background: "#fff3cd",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "25px"
            }}
          >
            Farm information not found.
          </div>

        )}


        {/* AI BUTTON */}

        <button
          onClick={getRecommendation}
          disabled={loading || !farm}
          style={{
            marginTop: "30px",
            padding: "15px 30px",
            border: "none",
            borderRadius: "10px",
            background: "#2e7d32",
            color: "white",
            fontSize: "17px",
            cursor:
              loading || !farm
                ? "not-allowed"
                : "pointer"
          }}
        >

          {loading
            ? "🤖 Generating Recommendation..."
            : "🤖 Get AI Recommendation"}

        </button>


        {/* ERROR */}

        {error && (

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#ffebee",
              color: "#c62828",
              borderRadius: "10px"
            }}
          >
            {error}
          </div>

        )}


        {/* AI RESULT */}

        {recommendation && (

          <div
            style={{
              marginTop: "30px",
              display: "grid",
              gap: "20px"
            }}
          >

            {/* FERTILIZER */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "15px",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.08)"
              }}
            >

              <h2>
                🧪 Fertilizer Recommendation
              </h2>

              <p>
                {recommendation.fertilizer}
              </p>

            </div>


            {/* IRRIGATION */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "15px",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.08)"
              }}
            >

              <h2>
                💧 Irrigation Recommendation
              </h2>

              <p>
                {recommendation.irrigation}
              </p>

            </div>


            {/* CROP */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "15px",
                boxShadow:
                  "0 4px 15px rgba(0,0,0,0.08)"
              }}
            >

              <h2>
                🌾 Crop Advisory
              </h2>

              <p>
                {recommendation.crop}
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}