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
      // Fallback matching original data if forecast is empty
      const todayTemp = weather ? `${Math.round(weather.temperature)}°C` : "31°C";
      const todayHum = weather ? `${weather.humidity}%` : "94%";
      const todayWind = weather ? `${weather.rainfall || 0.5} mm` : "0.5 mm";
      const todayDesc = weather ? weather.description : "Drizzle";
      const { image, icon } = getConditionDetails(todayDesc);

      return [
        {
          id: 1,
          day: "Today",
          temp: todayTemp,
          condition: todayDesc,
          city,
          country: "India",
          humidity: todayHum,
          wind: todayWind,
          feels: weather ? `${Math.round(weather.temperature - 3)}°C` : "28°C",
          image,
          icon
        },
        {
          id: 2,
          day: "Tomorrow",
          temp: "28°C",
          condition: "Cloudy",
          city,
          country: "India",
          humidity: "72%",
          wind: "11 km/h",
          feels: "30°C",
          image: cloudy,
          icon: <WiCloud />
        },
        {
          id: 3,
          day: "Wednesday",
          temp: "26°C",
          condition: "Rain",
          city,
          country: "India",
          humidity: "91%",
          wind: "18 km/h",
          feels: "27°C",
          image: rainy,
          icon: <WiRain />
        },
        {
          id: 4,
          day: "Thursday",
          temp: "25°C",
          condition: "Storm",
          city,
          country: "India",
          humidity: "93%",
          wind: "25 km/h",
          feels: "25°C",
          image: storm,
          icon: <WiThunderstorm />
        },
        {
          id: 5,
          day: "Friday",
          temp: "29°C",
          condition: "Sunrise",
          city,
          country: "India",
          humidity: "61%",
          wind: "12 km/h",
          feels: "31°C",
          image: sunrise,
          icon: <WiSunrise />
        },
        {
          id: 6,
          day: "Saturday",
          temp: "27°C",
          condition: "Mist",
          city,
          country: "India",
          humidity: "84%",
          wind: "8 km/h",
          feels: "28°C",
          image: mist,
          icon: <WiFog />
        },
        {
          id: 7,
          day: "Sunday",
          temp: "24°C",
          condition: "Night",
          city,
          country: "India",
          humidity: "55%",
          wind: "9 km/h",
          feels: "25°C",
          image: night,
          icon: <WiNightClear />
        }
      ];
    }

    return forecast.slice(0, 7).map((f, idx) => {
      const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : new Date(f.date).toLocaleDateString([], { weekday: "long" });
      const { image, icon } = getConditionDetails(f.description);
      const tempAvg = Math.round((f.tempMax + f.tempMin) / 2);

      return {
        id: idx + 1,
        day: dayName,
        temp: `${Math.round(f.tempMax)}°C`,
        condition: f.description,
        city,
        country: "India",
        humidity: `${f.humidity}%`,
        wind: `${f.rainfall || 0} mm`,
        feels: `${tempAvg}°C`,
        image,
        icon
      };
    });
  }, [forecast, city, weather]);

  const [active, setActive] = useState(0);

  const current = weatherData[active] || weatherData[0] || {
    day: "Today",
    temp: "31°C",
    condition: "Drizzle",
    city: "Coimbatore",
    country: "India",
    humidity: "94%",
    wind: "0.5 mm",
    feels: "28°C",
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
                  <h4>Feels Like</h4>
                  <p>{current.feels}</p>
                </div>
                <div className="small-box">
                  <FaTint />
                  <h4>Humidity</h4>
                  <p>{current.humidity}</p>
                </div>
                <div className="small-box">
                  <FaWind />
                  <h4>Precipitation</h4>
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
                <span>Pressure</span>
                <h3>1008 hPa</h3>
              </div>
              <div className="floating-item">
                <span>Visibility</span>
                <h3>8 km</h3>
              </div>
              <div className="floating-item">
                <span>UV Index</span>
                <h3>5</h3>
              </div>
              <div className="floating-item">
                <span>Rain Chance</span>
                <h3>18%</h3>
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