import React, { useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  LayersControl,
  ScaleControl,
  useMap
} from "react-leaflet";
import L from "leaflet";
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

/* ==========================================
        FIT MAP TO FARM POLYGON OR POINT
========================================== */
function FitBounds({ polygon, center }) {
  const map = useMap();

  useEffect(() => {
    if (polygon && polygon.length >= 3) {
      try {
        const bounds = L.latLngBounds(polygon);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 18 });
      } catch (e) {
        console.warn("Error fitting polygon bounds", e);
      }
    } else if (center && center[0] && center[1]) {
      map.setView(center, 15);
    }
  }, [map, polygon, center]);

  return null;
}

/* ==========================================
        LEAFLET VIEWER COMPONENT
========================================== */
export default function LeafletViewer({ farm }) {
  // Parse farm polygon boundary coordinates
  const polygon = useMemo(() => {
    if (!farm) return [];
    if (Array.isArray(farm.coordinates) && farm.coordinates.length >= 3) {
      return farm.coordinates;
    }
    if (farm.location && typeof farm.location === "string") {
      const locStr = farm.location.trim();
      if (locStr.includes(" | ")) {
        try {
          const jsonPart = locStr.split(" | ").slice(1).join(" | ").trim();
          const parsed = JSON.parse(jsonPart);
          if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
        } catch (e) {}
      } else if (locStr.startsWith("[")) {
        try {
          const parsed = JSON.parse(locStr);
          if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
        } catch (e) {}
      }
    }
    return [];
  }, [farm]);

  // Parse crop specific planted polygon coordinates
  const cropPolygon = useMemo(() => {
    if (!farm) return [];
    if (Array.isArray(farm.cropCoordinates) && farm.cropCoordinates.length >= 3) {
      return farm.cropCoordinates;
    }
    return [];
  }, [farm]);

  // Center point
  const center = useMemo(() => {
    if (cropPolygon.length >= 3) {
      try {
        const bounds = L.latLngBounds(cropPolygon);
        return bounds.getCenter();
      } catch (e) {}
    }
    if (polygon.length >= 3) {
      try {
        const bounds = L.latLngBounds(polygon);
        return bounds.getCenter();
      } catch (e) {}
    }
    if (farm && farm.latitude && farm.longitude && !isNaN(Number(farm.latitude)) && !isNaN(Number(farm.longitude))) {
      return [Number(farm.latitude), Number(farm.longitude)];
    }
    return [11.0168, 76.9558];
  }, [farm, polygon, cropPolygon]);

  const farmName = farm?.farmName || farm?.name || "Farm Plot";
  const soilType = farm?.soilType || farm?.soil || "Black Soil";
  const waterSource = farm?.waterSource || farm?.water || "Borewell";
  const farmArea = farm?.area ? (String(farm.area).toLowerCase().includes("acre") ? String(farm.area) : `${farm.area} Acres`) : "N/A";
  const cropPlantedArea = farm?.cropPlantedArea ? (String(farm.cropPlantedArea).toLowerCase().includes("acre") ? String(farm.cropPlantedArea) : `${farm.cropPlantedArea} Acres`) : farmArea;
  const farmCrop = farm?.cropName || farm?.crop || "Active Crop";
  const locationText = farm?.location ? farm.location.split(" | ")[0] : (farm?.district || "Local Region");

  const fitBoundsPoly = cropPolygon.length >= 3 ? cropPolygon : polygon;

  return (
    <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.05)" }}>
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        style={{
          width: "100%",
          height: "340px",
          borderRadius: "18px 18px 0 0"
        }}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Satellite + Places">
            <TileLayer
              attribution="Tiles © Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              attribution="Esri Places"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>
          <BaseLayer name="Street Map">
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
        </LayersControl>

        <ScaleControl position="bottomleft" />
        <FitBounds polygon={fitBoundsPoly} center={center} />

        {/* Farm Boundary Outer Polygon */}
        {polygon.length >= 3 && cropPolygon.length >= 3 && (
          <Polygon
            positions={polygon}
            pathOptions={{
              color: "#ea580c",
              fillColor: "#fed7aa",
              fillOpacity: 0.15,
              weight: 2,
              dashArray: "6, 6"
            }}
          />
        )}

        {/* Planted Crop Area Polygon */}
        {cropPolygon.length >= 3 ? (
          <Polygon
            positions={cropPolygon}
            pathOptions={{
              color: "#16a34a",
              fillColor: "#22c55e",
              fillOpacity: 0.5,
              weight: 3
            }}
          />
        ) : polygon.length >= 3 ? (
          <Polygon
            positions={polygon}
            pathOptions={{
              color: "#16a34a",
              fillColor: "#22c55e",
              fillOpacity: 0.35,
              weight: 3
            }}
          />
        ) : null}

        {/* Center Marker */}
        <Marker position={center}>
          <Popup>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              <strong style={{ fontSize: 14, color: "#15803d" }}>{farmCrop} ({farmName})</strong><br />
              📍 Location: {locationText}<br />
              🌱 Crop Area: {cropPlantedArea}<br />
              📐 Farm Total: {farmArea}<br />
              💧 Water: {waterSource}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Farm Information Footer */}
      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Farm Name</span>
          <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{farmName}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Farmland</span>
          <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: "#475569" }}>{farmArea}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Crop Planted Area</span>
          <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: "#15803d" }}>{cropPlantedArea}</p>
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Soil & Water</span>
          <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "#334155" }}>{soilType} · {waterSource}</p>
        </div>
      </div>
    </div>
  );
}