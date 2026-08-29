import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../styles/farm.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";
import LeafletMap from "../components/LeafletMap";

import {
  FaArrowLeft,
  FaSeedling,
  FaTint,
  FaFileUpload,
  FaSave
} from "react-icons/fa";

import { addFarmAction } from "../main";

export default function AddFarm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);
  const user = useSelector((state) => state.agri.user);
  const farms = useSelector((state) => state.agri.farms) || [];

  const [farm, setFarm] = useState({
    farmName: "",
    village: "",
    district: "",
    state: "",
    soil: "Black Soil",
    ownership: "Owned",
    waterSource: "Borewell",
    irrigation: "Drip Irrigation",
    crop: "Rice",
    season: "Kharif",
    plantingDate: ""
  });

  const [boundary, setBoundary] = useState({
    geoJson: null,
    coordinates: [],
    center: null,
    bounds: null,
    areaSquareMeters: 0,
    areaAcres: 0,
    areaHectares: 0
  });

  const handleChange = (e) => {
    setFarm({
      ...farm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const areaVal = boundary.areaAcres > 0 
      ? parseFloat(boundary.areaAcres.toFixed(2)) 
      : 1.0;

    let latVal = null;
    let lngVal = null;

    if (boundary.center) {
      latVal = boundary.center.lat;
      lngVal = boundary.center.lng;
    } else if (boundary.coordinates && boundary.coordinates.length > 0) {
      latVal = boundary.coordinates[0][0];
      lngVal = boundary.coordinates[0][1];
    }

    const serializedLocation = boundary.coordinates.length > 0
      ? `${farm.village || "Coimbatore"} | ${JSON.stringify(boundary.coordinates)}`
      : farm.village || "Coimbatore";

    const payload = {
      farmName: farm.farmName,
      location: serializedLocation,
      area: areaVal,
      soilType: farm.soil,
      waterSource: farm.waterSource,
      latitude: latVal,
      longitude: lngVal
    };

    try {
      if (!demoMode) {
        const res = await fetch("http://localhost:8082/api/farms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const createdFarm = await res.json();
          // Store actual polygon coordinates in localStorage for mapping in demo runs if needed
          localStorage.setItem(`farm_coords_${createdFarm.farmId}`, JSON.stringify(boundary.coordinates));
          dispatch(addFarmAction(createdFarm));
          toast.success("Farm registered successfully in database!");
          navigate("/farm-management");
          return;
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to register farm plot.");
          return;
        }
      }
    } catch (err) {
      console.warn("Farm microservice offline, fallback to local state.", err);
    }

    // Fallback/Demo mode local save
    const mockFarmId = Date.now();
    const mockFarm = {
      farmId: mockFarmId,
      userId: user ? user.userId : 101,
      farmName: farm.farmName,
      location: serializedLocation,
      area: areaVal,
      soilType: farm.soil,
      waterSource: farm.waterSource,
      latitude: latVal || 11.0168,
      longitude: lngVal || 76.9558
    };

    // Store polygon coordinates locally
    localStorage.setItem(`farm_coords_${mockFarmId}`, JSON.stringify(boundary.coordinates));
    
    dispatch(addFarmAction(mockFarm));
    toast.success("Farm registered locally (Demo Mode)!");
    navigate("/farm-management");
  };

  return (
    <>
      <Navbar />
      <FloatingAI />

      <div className="addFarmPage">
        <div className="addFarmContainer">
          <button className="backButton" onClick={() => navigate("/farm-management")}>
            <FaArrowLeft />
            Back to Farms
          </button>

          <div className="pageHeader">
            <h1>Register New Farm</h1>
            <p>Register your farm by drawing its exact boundary.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* BASIC INFORMATION */}
            <div className="formSection">
              <h2>Basic Information</h2>
              <div className="formGrid">
                <div className="formGroup">
                  <label>Farm Name</label>
                  <input
                    type="text"
                    name="farmName"
                    value={farm.farmName}
                    onChange={handleChange}
                    placeholder="e.g. Green Valley Farm"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Village/Town</label>
                  <input
                    type="text"
                    name="village"
                    value={farm.village}
                    onChange={handleChange}
                    placeholder="e.g. Coimbatore"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>District</label>
                  <input
                    type="text"
                    name="district"
                    value={farm.district}
                    onChange={handleChange}
                    placeholder="e.g. Coimbatore"
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={farm.state}
                    onChange={handleChange}
                    placeholder="e.g. Tamil Nadu"
                    required
                  />
                </div>
              </div>
            </div>

            {/* AGRONOMIC DETAILS */}
            <div className="formSection">
              <h2>Agronomic Details</h2>
              <div className="formGrid">
                <div className="formGroup">
                  <label>
                    <FaSeedling /> Soil Type
                  </label>
                  <select name="soil" value={farm.soil} onChange={handleChange} required>
                    <option value="Black Soil">Black Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Clayey">Clayey</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Sandy Soil">Sandy Soil</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>Ownership</label>
                  <select name="ownership" value={farm.ownership} onChange={handleChange} required>
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                    <option value="Sharecropped">Sharecropped</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>
                    <FaTint /> Water Source
                  </label>
                  <select name="waterSource" value={farm.waterSource} onChange={handleChange} required>
                    <option value="Borewell">Borewell</option>
                    <option value="Canal">Canal</option>
                    <option value="Rainfed">Rainfed</option>
                    <option value="Open Well">Open Well</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>Irrigation Type</label>
                  <select name="irrigation" value={farm.irrigation} onChange={handleChange} required>
                    <option value="Drip Irrigation">Drip Irrigation</option>
                    <option value="Sprinkler Irrigation">Sprinkler Irrigation</option>
                    <option value="Flood Irrigation">Flood Irrigation</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DRAW BOUNDARY MAP */}
            <div className="formSection">
              <h2>Draw Farm Boundary</h2>
              <p className="sectionHelp">Click on the map to define the corners of your farm. Double-click or click the first point to close the polygon.</p>
              
              <div className="mapWrapper">
                <LeafletMap onPolygonChange={setBoundary} />
              </div>

              {boundary.areaAcres > 0 && (
                <div className="areaStats">
                  <div className="statCard">
                    <span>Calculated Area</span>
                    <strong>{boundary.areaAcres.toFixed(2)} Acres</strong>
                  </div>
                  <div className="statCard">
                    <span>Hectares</span>
                    <strong>{boundary.areaHectares.toFixed(2)} Ha</strong>
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="formActions">
              <button
                type="button"
                className="cancelBtn"
                onClick={() => navigate("/farm-management")}
              >
                Cancel
              </button>
              <button className="saveBtn" type="submit">
                <FaSave />
                Register Farm
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}