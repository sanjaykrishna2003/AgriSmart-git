import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../App.css";
import "../styles/sanjay.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  Tractor,
  Sprout,
  ClipboardList,
  Landmark,
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  CalendarDays,
  TriangleAlert,
  ListTodo,
  Bot
} from "lucide-react";

export default function Dashboard() {
  const user = useSelector((state) => state.agri.user);
  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];
  const weather = useSelector((state) => state.agri.weather);
  const broadcastNotifications = useSelector((state) => state.agri.broadcastNotifications) || [];

  const activeCrops = crops.filter(c => c.status === 'ACTIVE');

  // Filter regional alerts
  const filteredAlerts = broadcastNotifications.filter(n => {
    if (!user || !n || !n.targetRegion) return false;
    const region = n.targetRegion.toLowerCase();
    return region === 'all regions' ||
           (user.district && region === user.district.toLowerCase()) ||
           (user.state && region === user.state.toLowerCase());
  });

  // Calculate dynamic tasks based on active crops
  const tasks = [];
  if (activeCrops.length > 0) {
    activeCrops.forEach((crop, index) => {
      const farm = farms.find(f => f.farmId === crop.farmId);
      const farmName = farm ? farm.farmName : "Field";
      if (index === 0) {
        tasks.push({ id: 1, title: `Irrigate ${crop.cropName} in ${farmName}`, time: "08:00 AM" });
        tasks.push({ id: 2, title: `Check soil moisture for ${crop.cropName}`, time: "10:30 AM" });
      } else if (index === 1) {
        tasks.push({ id: 3, title: `Inspect ${crop.cropName} leaves for pests`, time: "02:00 PM" });
      } else {
        tasks.push({ id: index + 3, title: `Weed management in ${farmName}`, time: "04:30 PM" });
      }
    });
  } else {
    tasks.push({ id: 1, title: "Register a Farm Plot in Profile", time: "Anytime" });
    tasks.push({ id: 2, title: "Start a crop cultivation log", time: "Anytime" });
  }

  // Calculate dynamic recommendations based on crops and weather
  const recommendations = [];
  let rainForecasted = false;
  if (weather && weather.rainfall > 1.0) {
    rainForecasted = true;
  }

  if (activeCrops.length > 0) {
    activeCrops.forEach((crop, index) => {
      const cropName = (crop.cropName || '').toLowerCase();
      if (cropName.includes('rice') || cropName.includes('paddy')) {
        recommendations.push({
          id: index + 1,
          title: `${crop.cropName} NPK Ratio`,
          message: "NPK 120:60:60 kg/ha recommended. Apply Nitrogen in splits."
        });
      } else if (cropName.includes('cotton')) {
        recommendations.push({
          id: index + 1,
          title: `${crop.cropName} Pest Warning`,
          message: "High risk of bollworm. Keep crop dry, apply neem oil if needed."
        });
      } else {
        recommendations.push({
          id: index + 1,
          title: `${crop.cropName} Nutrition`,
          message: "Apply general split NPK application during active vegetative stage."
        });
      }
    });

    if (rainForecasted) {
      recommendations.push({
        id: 99,
        title: "Irrigation Advisory",
        message: "Rain is forecasted in your district. Postpone scheduled watering."
      });
    } else {
      recommendations.push({
        id: 99,
        title: "Irrigation Schedule",
        message: "No heavy rain forecast in 3 days. Irrigate plots as scheduled."
      });
    }
  } else {
    recommendations.push({
      id: 1,
      title: "Add your Farm",
      message: "Please specify farm coordinates on the map to receive local weather alerts."
    });
  }

  // Calculate upcoming events
  const events = [];
  if (activeCrops.length > 0) {
    activeCrops.forEach((crop, index) => {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const rawDate = crop.expectedHarvestDate || crop.harvestDate;
      const dateObj = rawDate ? new Date(rawDate) : null;
      const isValid = dateObj && !isNaN(dateObj.getTime());
      events.push({
        id: index + 1,
        title: `${crop.cropName || 'Crop'} Harvest`,
        month: isValid ? months[dateObj.getMonth()] : "---",
        day:   isValid ? String(dateObj.getDate()).padStart(2, '0') : "--",
        date:  isValid ? dateObj.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }) : "Date not set"
      });
    });
  } else {
    events.push({
      id: 1,
      title: "Soil Testing Camp",
      month: "JUL",
      day: "10",
      date: "10 July 2026"
    });
  }

  // Get current date string
  const currentDate = new Date().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
  const currentDay = new Date().toLocaleDateString([], { weekday: 'long' });

  return (
    <>
      <Navbar />

      <div className="dashboard">
        {/* Welcome Section */}
        <div className="dashboard-welcome-card">
          <div>
            <h1>
              Welcome back,
              <span> {user ? user.name : "Farmer"}</span>
            </h1>
            <p>Here's a quick overview of your farm activities today.</p>
          </div>

          <div className="dashboard-date-card">
            <CalendarDays />
            <div>
              <h4>{currentDate}</h4>
              <p>{currentDay}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-summary-grid">
          <div className="dashboard-summary-card">
            <div className="dashboard-icon dashboard-green">
              <Tractor />
            </div>
            <div>
              <h4>Total Farms</h4>
              <h2>{farms.length}</h2>
            </div>
          </div>

          <div className="dashboard-summary-card">
            <div className="dashboard-icon dashboard-lightgreen">
              <Sprout />
            </div>
            <div>
              <h4>Active Crops</h4>
              <h2>{activeCrops.length}</h2>
            </div>
          </div>

          <div className="dashboard-summary-card">
            <div className="dashboard-icon dashboard-orange">
              <ClipboardList />
            </div>
            <div>
              <h4>Pending Tasks</h4>
              <h2>{tasks.length}</h2>
            </div>
          </div>

          <div className="dashboard-summary-card">
            <div className="dashboard-icon dashboard-purple">
              <Landmark />
            </div>
            <div>
              <h4>Eligible Schemes</h4>
              <h2>{user ? 3 : 0}</h2>
            </div>
          </div>
        </div>

        {/* Weather Card */}
        <div className="dashboard-weather-card">
          <div className="dashboard-weather-header">
            <CloudSun />
            <h2>Today's Weather Update</h2>
          </div>

          {weather ? (
            <div className="dashboard-weather-content">
              <div className="dashboard-weather-left">
                <CloudSun className="dashboard-weather-icon" />
                <h1>{Math.round(weather.temperature)}°C</h1>
                <h3>{weather.description}</h3>
              </div>

              <div className="dashboard-weather-right">
                <div>
                  <Droplets />
                  <span>Humidity</span>
                  <strong>{weather.humidity}%</strong>
                </div>
                <div>
                  <CloudRain />
                  <span>Rainfall</span>
                  <strong>{weather.rainfall || 0} mm</strong>
                </div>
                <div>
                  <Wind />
                  <span>Wind Speed</span>
                  <strong>{weather.windSpeed || 4.5} km/h</strong>
                </div>
                <div>
                  <CalendarDays />
                  <span>Updated</span>
                  <strong>{weather.recordedAt ? new Date(weather.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-weather-content" style={{ justifyContent: "center", padding: "30px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                No weather details synced. Add coordinates to your farm plot to view live weather parameters.
              </p>
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          {/* Advisory Panel */}
          <div className="dashboard-glass-panel">
            <div className="dashboard-section-title">
              <TriangleAlert />
              <h2>Official Advisory & Warnings</h2>
            </div>

            <div className="dashboard-scroll-box">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((item) => (
                  <div
                    key={item.id}
                    className={`dashboard-advisory ${item.type === 'Rain Alert' ? 'alert' : 'info'}`}
                  >
                    <h4>{item.title} ({item.targetRegion})</h4>
                    <p>{item.message}</p>
                    <span style={{ fontSize: '10px', color: 'gray', display: 'block', marginTop: '6px', textAlign: 'right' }}>
                      — {item.sender} ({new Date(item.timestamp).toLocaleDateString()})
                    </span>
                  </div>
                ))
              ) : (
                <div className="dashboard-advisory info">
                  <h4>No warnings in your region</h4>
                  <p>Weather parameters are stable in your district today. Keep monitoring updates.</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="dashboard-glass-panel">
            <div className="dashboard-section-title">
              <ListTodo />
              <h2>Today's Tasks</h2>
            </div>

            <div className="dashboard-scroll-box">
              {tasks.map((task) => (
                <div className="dashboard-task-item" key={task.id}>
                  <div>
                    <h4>{task.title}</h4>
                    <p>{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="dashboard-glass-panel">
            <div className="dashboard-section-title">
              <Bot />
              <h2>AI Recommendations</h2>
            </div>

            <div className="dashboard-scroll-box">
              {recommendations.map((item) => (
                <div className="dashboard-recommend-card" key={item.id}>
                  <h4>{item.title}</h4>
                  <p>{item.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-glass-panel">
            <div className="dashboard-section-title">
              <CalendarDays />
              <h2>Upcoming Events</h2>
            </div>

            <div className="dashboard-scroll-box">
              {events.map((event) => (
                <div className="dashboard-event-card" key={event.id}>
                  <div className="dashboard-event-date">
                    <span className="dashboard-event-month">{event.month}</span>
                    <span className="dashboard-event-day">{event.day}</span>
                  </div>
                  <div className="dashboard-event-details">
                    <h4>{event.title}</h4>
                    <p>{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}