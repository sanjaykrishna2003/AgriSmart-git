import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import "../sankari.css";
import Navbar from "../components/Navbar";

import sunny from "../assets/weather/sunny.jpg";
import cloudy from "../assets/weather/cloudy.jpg";
import rainy from "../assets/weather/rainy.jpg";
import storm from "../assets/weather/storm.jpg";
import sunrise from "../assets/weather/sunrise.jpg";
import mist from "../assets/weather/harvest.jpg";
import night from "../assets/weather/night.jpg";

import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiThunderstorm,
  WiSunrise,
  WiFog,
  WiNightClear
} from "react-icons/wi";

import {
  FaMapMarkerAlt,
  FaTemperatureHigh,
  FaTint,
  FaWind
} from "react-icons/fa";

export default function Weather() {
  const farms = useSelector((state) => state.agri.farms) || [];
  const forecast = useSelector((state) => state.agri.forecast) || [];
  const weather = useSelector((state) => state.agri.weather);

  const activeFarm = farms.length > 0 ? farms[0] : null;
  const rawCity = activeFarm ? activeFarm.location : "Coimbatore";
  const city = rawCity ? rawCity.split(" | ")[0] : "Coimbatore";

  const getConditionDetails = (desc) => {
    const d = (desc || "").toLowerCase();
    if (d.includes("sun") || d.includes("clear") || d.includes("fair")) {
      return { image: sunny, icon: <WiDaySunny /> };
    }
    if (d.includes("cloud") || d.includes("overcast") || d.includes("gloomy")) {
      return { image: cloudy, icon: <WiCloud /> };
    }
    if (d.includes("rain") || d.includes("drizzle") || d.includes("shower")) {
      return { image: rainy, icon: <WiRain /> };
    }
    if (d.includes("storm") || d.includes("thunder")) {
      return { image: storm, icon: <WiThunderstorm /> };
    }
    if (d.includes("fog") || d.includes("mist")) {
      return { image: mist, icon: <WiFog /> };
    }
    return { image: sunrise, icon: <WiSunrise /> };
  };

  const weatherData = useMemo(() => {
    if (forecast.length === 0) {
      // Fallback matching real backend weather data if forecast array is empty
      const curTempNum = weather?.temperature != null ? weather.temperature : 28.0;
      const curTemp = `${Math.round(curTempNum)}°C`;
      const curHum = weather?.humidity != null ? `${Math.round(weather.humidity)}%` : "70%";
      const curRainRaw = weather?.rainfall != null ? weather.rainfall : 0.0;
      const curRain = curRainRaw === 0 || curRainRaw == null ? "No rainfall" : `${curRainRaw.toFixed(1)} mm`;
      const curDesc = weather?.description || "Partly Cloudy";
      const curWindSpeedNum = weather?.windSpeed != null ? weather.windSpeed : 4.5;
      const curWind = `${Math.round(curWindSpeedNum * 3.6)} km/h`;
      const { image, icon } = getConditionDetails(curDesc);

      const tMin = Math.round(curTempNum - 3);
      const tMax = Math.round(curTempNum + 3);

      return [
        {
          id: 1,
          day: "Today",
          temp: curTemp,
          condition: curDesc,
          city,
          country: "India",
          humidity: curHum,
          rainfall: curRain,
          wind: curWind,
          feels: curTemp,
          tempMinMax: `${tMin}°C - ${tMax}°C`,
          image,
          icon
        }
      ];
    }

    return forecast.slice(0, 7).map((f, idx) => {
      const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : new Date(f.date).toLocaleDateString([], { weekday: "long" });
      const { image, icon } = getConditionDetails(f.description);
      const tMax = f.tempMax != null ? Math.round(f.tempMax) : (weather?.temperature != null ? Math.round(weather.temperature) : 28);
      const tMin = f.tempMin != null ? Math.round(f.tempMin) : Math.max(15, tMax - 6);
      const mainTemp = idx === 0 && weather?.temperature != null ? `${Math.round(weather.temperature)}°C` : `${tMax}°C`;

      const humidityVal = f.humidity != null ? `${Math.round(f.humidity)}%` : (weather?.humidity != null ? `${Math.round(weather.humidity)}%` : "70%");
      const rainRaw = f.rainfall != null ? f.rainfall : (idx === 0 && weather?.rainfall != null ? weather.rainfall : 0);
      const rainFormatted = rainRaw === 0 || rainRaw == null ? "No rainfall" : `${Number(rainRaw).toFixed(1)} mm`;
      
      const speedMs = weather?.windSpeed != null ? weather.windSpeed : 4.5;
      const windFormatted = `${Math.round(speedMs * 3.6)} km/h`;

      return {
        id: idx + 1,
        day: dayName,
        temp: mainTemp,
        condition: f.description || weather?.description || "Clouds",
        city,
        country: "India",
        humidity: humidityVal,
        rainfall: rainFormatted,
        wind: windFormatted,
        tempMinMax: `${tMin}°C - ${tMax}°C`,
        image,
        icon
      };
    });
  }, [forecast, city, weather]);

  const [active, setActive] = useState(0);

  const current = weatherData[active] || weatherData[0] || {
    day: "Today",
    temp: "28°C",
    condition: "Partly Cloudy",
    city: "Coimbatore",
    country: "India",
    humidity: "70%",
    rainfall: "No rainfall",
    wind: "16 km/h",
    tempMinMax: "22°C - 28°C",
    image: mist,
    icon: <WiFog />
  };

  return (
    <>
      <Navbar />

      <div
        className="weather-v2"
        style={{
          backgroundImage: `url(${current.image})`
        }}
      >
        <div className="weather-dark-layer">
          <div className="weather-content">
            <div className="weather-left">
              <h5 className="weather-day">
                {current.day.toUpperCase()}
              </h5>
              <h1 style={{ color: "#ffffff" }} className="weather-temp">
                {current.temp}
              </h1>
              <div className="weather-condition">
                <div className="condition-icon"> {current.icon} </div>
                <span> {current.condition} </span>
              </div>
              <div className="weather-location">
                <FaMapMarkerAlt />
                <p>
                  {current.city}, {current.country}
                </p>
              </div>
              <div className="weather-small-boxes">
                <div className="small-box">
                  <FaTemperatureHigh />
                  <h4>Temp Range</h4>
                  <p>{current.tempMinMax}</p>
                </div>
                <div className="small-box">
                  <FaTint />
                  <h4>Humidity</h4>
                  <p>{current.humidity}</p>
                </div>
                <div className="small-box">
                  <FaWind />
                  <h4>Wind Speed</h4>
                  <p>{current.wind}</p>
                </div>
              </div>
            </div>

            <div className="weather-right">
              <div className="weather-right-panel">
                <div className="weather-card-stack">
                  {weatherData.map((item, index) => {
                    const position = (index - active + weatherData.length) % weatherData.length;
                    if (position > 3) return null;
                    return (
                      <div
                        key={item.id}
                        className={`weather-preview-card ${position === 0 ? "active-preview" : ""}`}
                        onClick={() => setActive(index)}
                        style={{
                          left: `${position * 95}px`,
                          top: `${position * 18}px`,
                          zIndex: 20 - position,
                          backgroundImage: `url(${item.image})`
                        }}
                      >
                        <div className="preview-overlay">
                          <div className="preview-top">
                            <h2>{item.day}</h2>
                          </div>
                          <div className="preview-middle">
                            <div className="preview-icon">{item.icon}</div>
                          </div>
                          <div className="preview-bottom">
                            <h3>{item.temp}</h3>
                            <p>{item.condition}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="weather-floating-panel">
              <div className="floating-item">
                <span>Rainfall</span>
                <h3 style={{ fontSize: "20px" }}>{current.rainfall}</h3>
              </div>
              <div className="floating-item">
                <span>Wind Speed</span>
                <h3 style={{ fontSize: "20px" }}>{current.wind}</h3>
              </div>
              <div className="floating-item">
                <span>Temp Range</span>
                <h3 style={{ fontSize: "20px" }}>{current.tempMinMax}</h3>
              </div>
              <div className="floating-item">
                <span>Air Humidity</span>
                <h3 style={{ fontSize: "20px" }}>{current.humidity}</h3>
              </div>
            </div>

            <div className="weather-page-number">
              <span>{String(current.id).padStart(2, "0")}</span>
              <div className="page-line"></div>
              <span>{String(weatherData.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}