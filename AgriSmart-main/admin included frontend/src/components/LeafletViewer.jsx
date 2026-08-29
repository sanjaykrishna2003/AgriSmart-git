import { useMemo, useEffect } from "react";

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
        FIT MAP TO FARM
========================================== */

function FitBounds({ polygon }){

    const map = useMap();

    useEffect(()=>{

        if(!polygon || polygon.length < 3)

            return;

        const bounds = L.latLngBounds(polygon);

        map.fitBounds(bounds,{

            padding:[40,40],

            maxZoom:18

        });

    },[map,polygon]);

    return null;

}

/* ==========================================
        MAIN COMPONENT
========================================== */

function LeafletViewer({

    farm

}){

    const polygon = useMemo(() => {
        if (!farm) return [];
        if (farm.coordinates && farm.coordinates.length >= 3) {
            return farm.coordinates;
        }
        if (farm.location) {
            if (farm.location.includes(" | ")) {
                try {
                    const jsonPart = farm.location.split(" | ").slice(1).join(" | ").trim();
                    const parsed = JSON.parse(jsonPart);
                    if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
                } catch (e) {}
            } else if (farm.location.trim().startsWith("[")) {
                try {
                    const parsed = JSON.parse(farm.location);
                    if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
                } catch (e) {}
            }
        }
        return [];
    }, [farm]);

    const center = useMemo(()=>{

        if(polygon.length===0)

            return [11.0168,76.9558];

        const bounds = L.latLngBounds(polygon);

        return bounds.getCenter();

    },[polygon]);

    return(

        <div className="viewerContainer">

            <MapContainer

                center={center}

                zoom={16}

                scrollWheelZoom={true}

                style={{

                    width:"100%",

                    height:"500px",

                    borderRadius:"18px"

                }}

            >

                <LayersControl position="topright">

                    <BaseLayer checked name="Satellite + Place Labels">

                        <TileLayer

                            attribution="Tiles © Esri"

                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

                        />
                        <TileLayer

                            attribution="Esri Boundaries & Places"

                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"

                        />

                    </BaseLayer>

                    <BaseLayer name="Street Map (OSM)">

                        <TileLayer

                            attribution="© OpenStreetMap"

                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                        />

                    </BaseLayer>

                </LayersControl>

                <ScaleControl />

                <FitBounds polygon={polygon} />
                                {/* ==========================================
                        FARM POLYGON
                ========================================== */}

                {
                    polygon.length >= 3 && (
                        <Polygon
                            positions={polygon}
                            pathOptions={{
                                color: farm.cropCoordinates && farm.cropCoordinates.length >= 3 ? "#d97706" : "#2E7D32",
                                fillColor: farm.cropCoordinates && farm.cropCoordinates.length >= 3 ? "#fef3c7" : "#43A047",
                                fillOpacity: farm.cropCoordinates && farm.cropCoordinates.length >= 3 ? 0.1 : 0.35,
                                weight: farm.cropCoordinates && farm.cropCoordinates.length >= 3 ? 3 : 4,
                                dashArray: farm.cropCoordinates && farm.cropCoordinates.length >= 3 ? "6,6" : undefined
                            }}
                        />
                    )
                }
                {
                    farm.cropCoordinates && farm.cropCoordinates.length >= 3 && (
                        <Polygon
                            positions={farm.cropCoordinates}
                            pathOptions={{
                                color: "#16a34a",
                                fillColor: "#4ca35a",
                                fillOpacity: 0.4,
                                weight: 3
                            }}
                        />
                    )
                }

                {/* ==========================================
                        FARM CENTER MARKER
                ========================================== */}

                {

                    polygon.length > 0 && (

                        <Marker position={center}>

                            <Popup>

                                <div>

                                    <strong>

                                        {farm.name}

                                    </strong>

                                    <br/>

                                    🌱 {farm.soil}

                                    <br/>

                                    📐 {farm.area}

                                    <br/>

                                    💧 {farm.water}

                                </div>

                            </Popup>

                        </Marker>

                    )

                }

            </MapContainer>

            {/* ==========================================
                    FARM INFORMATION
            ========================================== */}

            <div className="viewerInfo">

                <div>

                    <h3>

                        {farm.name}

                    </h3>

                    <p>

                        📍 {farm.village}, {farm.state}

                    </p>

                </div>

                <div>

                    <p>

                        🌱 <strong>Soil:</strong> {farm.soil}

                    </p>

                    <p>

                        📐 <strong>Area:</strong> {farm.area}

                    </p>

                </div>

                <div>

                    <p>

                        💧 <strong>Water:</strong> {farm.water}

                    </p>

                    <p>

                        🌾 <strong>Crop:</strong> {farm.crop}

                    </p>

                </div>

            </div>

        </div>

    );

}

export default LeafletViewer;