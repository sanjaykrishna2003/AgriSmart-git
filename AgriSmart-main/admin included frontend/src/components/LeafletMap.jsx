import { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  LayersControl,
  ScaleControl,
  useMap,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import { FaSearch, FaMapMarkerAlt, FaSyncAlt, FaTrash, FaCrosshairs } from "react-icons/fa";

import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const { BaseLayer } = LayersControl;

const DEFAULT_CENTER = [11.0168, 76.9558];

// Create a custom center handle icon for whole polygon movement
const centerMoveIcon = L.divIcon({
  className: "custom-polygon-center-icon",
  html: `<div style="
    background: #166534;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.35);
    font-size: 14px;
    cursor: move;
  ">✥</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const getInitialSquare = (center = DEFAULT_CENTER) => {
  const [lat, lng] = center;
  const d = 0.0008; // ~80m offset creating a square plot (~1.5 to 2 acres)
  return [
    [lat - d, lng - d],
    [lat + d, lng - d],
    [lat + d, lng + d],
    [lat - d, lng + d]
  ];
};

/* ==========================================
        MAP CONTROLLER (FLY TO & CLICKS)
========================================== */
function MapController({ searchCenter, setCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (searchCenter) {
      map.flyTo(searchCenter, 16, { duration: 1.5 });
    }
  }, [searchCenter, map]);

  useMapEvents({
    click(e) {
      // Optional: append extra vertices if farmer wants a custom non-quad polygon
      setCoordinates((prev) => {
        if (prev.length === 0) {
          return getInitialSquare([e.latlng.lat, e.latlng.lng]);
        }
        return [...prev, [e.latlng.lat, e.latlng.lng]];
      });
    }
  });

  return null;
}

/* ==========================================
        MAIN LEAFLET MAP COMPONENT
========================================== */
function LeafletMap({ onPolygonChange, farmCoordinates, activeCropPolygons }) {
  const [coordinates, setCoordinates] = useState(() => getInitialSquare());
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  const [searchError, setSearchError] = useState("");

  // Center crop coordinates inside the selected farm boundaries whenever they change
  useEffect(() => {
    if (farmCoordinates && farmCoordinates.length >= 3) {
      const bounds = L.latLngBounds(farmCoordinates);
      const center = bounds.getCenter();
      setCoordinates(getInitialSquare([center.lat, center.lng]));
      setSearchCenter([center.lat, center.lng]);
    }
  }, [farmCoordinates]);

  // Notify parent of polygon updates
  useEffect(() => {
    if (coordinates.length < 3) {
      onPolygonChange({
        geoJson: null,
        coordinates,
        areaSquareMeters: 0,
        areaAcres: 0,
        areaHectares: 0,
        center: null
      });
      return;
    }

    const geoJson = turf.polygon([
      coordinates
        .map((point) => [point[1], point[0]])
        .concat([[coordinates[0][1], coordinates[0][0]]])
    ]);

    const sqm = turf.area(geoJson);
    const acres = sqm * 0.000247105;
    const hectares = sqm / 10000;
    const bounds = L.latLngBounds(coordinates);
    const center = bounds.getCenter();

    onPolygonChange({
      geoJson,
      coordinates,
      center,
      areaSquareMeters: Number(sqm.toFixed(2)),
      areaAcres: Number(acres.toFixed(2)),
      areaHectares: Number(hectares.toFixed(2))
    });
  }, [coordinates, onPolygonChange]);

  // Search area using OpenStreetMap Nominatim Geocoder API
  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError("");

    try {
      // First try query as entered
      let res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      let data = await res.json();

      // If not found, try appending India
      if ((!data || data.length === 0) && !searchQuery.toLowerCase().includes("india")) {
        res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${searchQuery}, India`
          )}`
        );
        data = await res.json();
      }

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const newCenter = [lat, lon];
        setSearchCenter(newCenter);
        setCoordinates(getInitialSquare(newCenter));
        setSearchError("");
      } else {
        setSearchError("Area not found. Try entering district, town, or village name.");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setSearchError("Failed to search area. Please check network connection.");
    } finally {
      setSearching(false);
    }
  };

  // Center coordinate of current polygon
  const currentCenter =
    coordinates.length >= 3
      ? L.latLngBounds(coordinates).getCenter()
      : DEFAULT_CENTER;

  // Whole polygon translation logic (drag center anchor)
  const handleCenterDragEnd = (e) => {
    const newCenter = e.target.getLatLng();
    const oldCenter = L.latLngBounds(coordinates).getCenter();

    const dLat = newCenter.lat - oldCenter.lat;
    const dLng = newCenter.lng - oldCenter.lng;

    setCoordinates((prev) =>
      prev.map(([lat, lng]) => [lat + dLat, lng + dLng])
    );
  };

  return (
    <div className="leafletWrapper" style={{ position: "relative" }}>
      {/* ==========================================
              SEARCH BAR OVERLAY
      ========================================== */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          backgroundColor: "#fff",
          padding: "8px 12px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          alignItems: "center",
          border: "1px solid #cbd5e1"
        }}
      >
        <FaMapMarkerAlt style={{ color: "#166534", fontSize: "18px" }} />
        <input
          type="text"
          placeholder="Search town, village or area to navigate (e.g. Coimbatore, Warangal)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(e);
            }
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "#1e293b",
            background: "transparent"
          }}
        />
        <button
          type="button"
          disabled={searching}
          onClick={(e) => handleSearch(e)}
          style={{
            backgroundColor: "#166534",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px"
          }}
        >
          <FaSearch />
          {searching ? "Searching..." : "Navigate"}
        </button>
      </div>

      {searchError && (
        <div
          style={{
            color: "#dc2626",
            fontSize: "12.5px",
            marginBottom: "8px",
            padding: "4px 8px",
            background: "#fef2f2",
            borderRadius: "6px"
          }}
        >
          ⚠️ {searchError}
        </div>
      )}

      {/* ==========================================
              MAP CONTAINER
      ========================================== */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={16}
        maxZoom={21}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "520px",
          borderRadius: "18px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)"
        }}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Satellite + Place Labels">
            <TileLayer
              attribution="Esri World Imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={21}
              maxNativeZoom={19}
            />
            {/* High-contrast Place Name & Road Text Labels overlay */}
            <TileLayer
              attribution="Esri Boundaries & Places"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={21}
              maxNativeZoom={19}
            />
          </BaseLayer>

          <BaseLayer name="Street Map (OSM)">
            <TileLayer
              attribution="OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={21}
              maxNativeZoom={19}
            />
          </BaseLayer>

          <BaseLayer name="Pure Satellite">
            <TileLayer
              attribution="Esri World Imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={21}
              maxNativeZoom={19}
            />
          </BaseLayer>
        </LayersControl>

        <ScaleControl position="bottomleft" />

        <MapController
          searchCenter={searchCenter}
          setCoordinates={setCoordinates}
        />

        {/* ==========================================
                POLYGON CORNER VERTICES (DRAGGABLE)
        ========================================== */}
        {coordinates.map((point, index) => (
          <Marker
            key={`vertex-${index}`}
            position={point}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const latLng = e.target.getLatLng();
                setCoordinates((prev) => {
                  const newCoords = [...prev];
                  newCoords[index] = [latLng.lat, latLng.lng];
                  return newCoords;
                });
              }
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              <span style={{ fontSize: "10px", fontWeight: "600", padding: "1px 4px" }}>
                #{index + 1}
              </span>
            </Tooltip>
          </Marker>
        ))}

        {/* ==========================================
                CENTRAL ANCHOR (MOVE WHOLE POLYGON)
        ========================================== */}
        {coordinates.length >= 3 && (
          <Marker
            position={currentCenter}
            draggable={true}
            icon={centerMoveIcon}
            eventHandlers={{
              dragend: handleCenterDragEnd
            }}
          >
            <Tooltip permanent direction="bottom" offset={[0, 8]}>
              <span style={{ fontSize: "10.5px", fontWeight: "600" }}>
                Drag ✥ to move plot
              </span>
            </Tooltip>
          </Marker>
        )}

        {/* ==========================================
                DRAW FARM BOUNDARY (LAND BORDERS)
        ========================================== */}
        {farmCoordinates && farmCoordinates.length >= 3 && (
          <Polygon
            positions={farmCoordinates}
            pathOptions={{
              color: "#ea580c",
              fillColor: "#ffedd5",
              fillOpacity: 0.1,
              weight: 3,
              dashArray: "6, 6"
            }}
          />
        )}

        {/* ==========================================
                DRAW EXISTING ACTIVE CROPS (RED BORDERS)
        ========================================== */}
        {activeCropPolygons && activeCropPolygons.map((ap, idx) => (
          <Polygon
            key={`active-crop-${ap.cropId}-${idx}`}
            positions={ap.coordinates}
            pathOptions={{
              color: "#dc2626", // red border
              fillColor: "#fca5a5", // light red fill
              fillOpacity: 0.35,
              weight: 2
            }}
          >
            <Tooltip permanent={false}>
              <span>Active Crop Area: {ap.cropName}</span>
            </Tooltip>
          </Polygon>
        ))}

        {/* ==========================================
                DRAW CROP POLYGON
        ========================================== */}
        {coordinates.length >= 3 && (
          <Polygon
            positions={coordinates}
            pathOptions={{
              color: "#15803d",
              fillColor: "#22c55e",
              fillOpacity: 0.38,
              weight: 4
            }}
          />
        )}
      </MapContainer>

      {/* ==========================================
              MAP CONTROLS & INFO
      ========================================== */}
      <div
        className="mapActions"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px",
          padding: "10px 14px",
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid #e2e8f0"
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="clearPolygonBtn"
            style={{
              backgroundColor: "#166534",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px"
            }}
            onClick={() => setCoordinates(getInitialSquare(currentCenter))}
          >
            <FaSyncAlt /> Reset to Square
          </button>
          <button
            type="button"
            className="clearPolygonBtn"
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px"
            }}
            onClick={() => setCoordinates([])}
          >
            <FaTrash /> Clear Polygon
          </button>
        </div>

        <div className="polygonInfo" style={{ fontSize: "13px", color: "#334155" }}>
          <span>
            Plot Vertices: <strong>{coordinates.length}</strong> (Drag corners or center ✥ handle to move/reshape)
          </span>
        </div>
      </div>
    </div>
  );
}

export default LeafletMap;