import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "./App.css";
import "./styles/admin.css";

// Farmer Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Crops from "./pages/Crops";
import AddCrop from "./pages/AddCrop";
import CropDetails from "./pages/CropDetails";
import Profile from "./pages/Profile";
import Chatbot from "./pages/Chatbot";
import Weather from "./pages/Weather";
import Schemes from "./pages/Schemes";
import OProfile from "./pages/OProfile";
import Farms from "./pages/Farms";
import AddFarm from "./pages/AddFarm";
import FarmDetails from "./pages/FarmDetails";

// Authentication Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Officer Pages
import OfficerDashboard from "./pages/OfficerDashboard";
import Farmers from "./pages/Farmers";
import OSchemes from "./pages/OSchemes";
import ONotification from "./pages/Onotification";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminSchemes from "./pages/AdminSchemes";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import OfficerVerification from "./pages/OfficerVerification";

// Redux Actions
import {
  setUser,
  setUsersList,
  setToken,
  setDemoMode,
  setApiOnline,
  setFarms,
  setCrops,
  setWeather,
  setForecast,
  setWeatherHistory,
  setAnalytics,
  setSchemes,
  setDocuments,
  setBroadcastNotifications,
  setAppliedSchemeIds
} from "./main";

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.agri.token);
  const user = useSelector((state) => state.agri.user);
  const demoMode = useSelector((state) => state.agri.demoMode);

  const mapWmoCodeToDescription = (code) => {
    switch (code) {
      case 0: return "Sunny";
      case 1: case 2: case 3: return "Partly Cloudy";
      case 45: case 48: return "Foggy";
      case 51: case 53: case 55: return "Drizzle";
      case 61: case 63: case 65: return "Rainy";
      case 71: case 73: case 75: return "Snowy";
      case 80: case 81: case 82: return "Rain Showers";
      case 95: case 96: case 99: return "Thunderstorm";
      default: return "Cloudy";
    }
  };

  const fetchWeatherDirectly = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,weather_code&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,rain_sum,weather_code&timezone=auto`);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        const daily = data.daily;
        dispatch(setWeather({
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          rainfall: current.rain,
          description: mapWmoCodeToDescription(current.weather_code),
          windSpeed: 4.5,
          recordedAt: new Date().toISOString()
        }));
        const items = [];
        for (let i = 0; i < 7; i++) {
          items.push({
            date: daily.time[i],
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            humidity: daily.relative_humidity_2m_max[i],
            rainfall: daily.rain_sum[i],
            description: mapWmoCodeToDescription(daily.weather_code[i])
          });
        }
        dispatch(setForecast(items));

        dispatch(setWeatherHistory([]));
      }
    } catch (e) {
      console.error("Open-Meteo fetch failed", e);
    }
  };

  const fetchDashboardData = async (tokenVal, userVal) => {
    if (!tokenVal || !userVal) return;
    const isFarmer = userVal.role === 'FARMER';
    const isOfficer = userVal.role === 'OFFICER';
    const isAdmin = userVal.role === 'ADMIN';

    try {
      const headers = { 'Authorization': `Bearer ${tokenVal}` };

      // 1. Fetch Farms for all roles
      let currentFarms = [];
      const farmsRes = await fetch(`http://localhost:8082/api/farms`, { headers });
      if (farmsRes.ok) {
        const farmData = await farmsRes.json();
        currentFarms = farmData.content || farmData || [];
        dispatch(setFarms(currentFarms));
      }

      // 2. Fetch Crops for all roles
      const cropsRes = await fetch(`http://localhost:8083/api/crops?size=1000`, { headers });
      if (cropsRes.ok) {
        const cropData = await cropsRes.json();
        dispatch(setCrops(cropData.content || cropData || []));
      }

      // 3. Fetch Users for Officers & Admins
      if (isOfficer || isAdmin) {
        const usersRes = await fetch(`http://localhost:8081/api/users`, { headers });
        if (usersRes.ok) {
          const userData = await usersRes.json();
          dispatch(setUsersList(userData.content || userData || []));
        }
      }

      // 3.5 Fetch Schemes for all roles
      const schemesRes = await fetch(`http://localhost:8085/api/schemes`, { headers });
      if (schemesRes.ok) {
        const schemeData = await schemesRes.json();
        dispatch(setSchemes(schemeData));
      }

      // 3.6 Fetch Broadcast Notifications for all roles
      const notificationsRes = await fetch(`http://localhost:8085/api/notifications`, { headers });
      if (notificationsRes.ok) {
        const notificationData = await notificationsRes.json();
        dispatch(setBroadcastNotifications(notificationData));
      }

      // 3.7 Fetch Scheme Applications for Farmer
      if (isFarmer) {
        const appRes = await fetch(`http://localhost:8085/api/schemes/applications/me`, { headers });
        if (appRes.ok) {
          const appData = await appRes.json();
          const appliedIds = appData.map(a => a.scheme_id || a.schemeId);
          dispatch(setAppliedSchemeIds(appliedIds));
        }

        // 3.8 Fetch farmer documents
        const docsRes = await fetch(`http://localhost:8081/api/documents/my`, { headers });
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          dispatch(setDocuments(Array.isArray(docsData) ? docsData : []));
        }
      }

      // 4. Fetch Analytics
      let analyticsEndpoint = '/api/analytics/farmer';
      if (isOfficer) analyticsEndpoint = '/api/analytics/officer';
      if (isAdmin) analyticsEndpoint = '/api/analytics/admin';

      const analyticsRes = await fetch(`http://localhost:8085${analyticsEndpoint}`, { headers });
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        dispatch(setAnalytics(analyticsData));
      }

      // 5. Fetch Weather for first farm
      if (isFarmer && currentFarms.length > 0) {
        const activeFarmId = currentFarms[0].farmId;
        const activeFarm = currentFarms[0];
        if (activeFarm.latitude && activeFarm.longitude) {
          const weatherRes = await fetch(`http://localhost:8084/api/weather/current/${activeFarmId}`, { headers });
          const forecastRes = await fetch(`http://localhost:8084/api/weather/forecast/${activeFarmId}`, { headers });
          const historyRes = await fetch(`http://localhost:8084/api/weather/history/${activeFarmId}`, { headers });

          if (weatherRes.ok) dispatch(setWeather(await weatherRes.json()));
          if (forecastRes.ok) {
            const forecastData = await forecastRes.json();
            dispatch(setForecast(forecastData.forecast || []));
          }
          if (historyRes.ok) dispatch(setWeatherHistory(await historyRes.json()));
        }
      }
    } catch (e) {
      console.warn("API error during dashboard data fetch", e);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetch(`http://localhost:8081/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const userData = await res.json();
            dispatch(setUser(userData));
            dispatch(setToken(storedToken));
            dispatch(setDemoMode(false));
            dispatch(setApiOnline(true));
            fetchDashboardData(storedToken, userData);
            return;
          }
        } catch (e) {
          console.warn("Backend offline.");
        }
      }

      // If no token exists, do not log in anyone
      if (!storedToken) {
        dispatch(setUser(null));
        dispatch(setToken(''));
        dispatch(setFarms([]));
        dispatch(setCrops([]));
        return;
      }

      // If profile API failed or token invalid, reset session
      dispatch(setUser(null));
      dispatch(setToken(''));
      dispatch(setFarms([]));
      dispatch(setCrops([]));
    };

    initializeApp();
  }, []);

  // Protected Route guards
  const RequireAuth = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
      if (user.role === 'OFFICER') return <Navigate to="/officer/dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <>
      <Routes>
        {/* ================= HOME ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= AUTHENTICATION ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= FARMER ================= */}
        <Route path="/dashboard" element={<RequireAuth allowedRoles={['FARMER']}><Dashboard /></RequireAuth>} />
        <Route path="/crops" element={<RequireAuth allowedRoles={['FARMER']}><Crops /></RequireAuth>} />
        <Route path="/crops/add" element={<RequireAuth allowedRoles={['FARMER']}><AddCrop /></RequireAuth>} />
        <Route path="/crops/:id" element={<RequireAuth allowedRoles={['FARMER']}><CropDetails /></RequireAuth>} />
        <Route path="/farm-management" element={<RequireAuth allowedRoles={['FARMER']}><Farms /></RequireAuth>} />
        <Route path="/farm-management/add" element={<RequireAuth allowedRoles={['FARMER']}><AddFarm /></RequireAuth>} />
        <Route path="/farm-management/:id" element={<RequireAuth allowedRoles={['FARMER']}><FarmDetails /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth allowedRoles={['FARMER']}><Profile /></RequireAuth>} />
        <Route path="/chatbot" element={<RequireAuth allowedRoles={['FARMER']}><Chatbot /></RequireAuth>} />
        <Route path="/weather" element={<RequireAuth allowedRoles={['FARMER']}><Weather /></RequireAuth>} />
        <Route path="/schemes" element={<RequireAuth allowedRoles={['FARMER']}><Schemes /></RequireAuth>} />

        {/* ================= OFFICER ================= */}
        <Route path="/officer/dashboard" element={<RequireAuth allowedRoles={['OFFICER']}><OfficerDashboard /></RequireAuth>} />
        <Route path="/officer/farmers" element={<RequireAuth allowedRoles={['OFFICER']}><Farmers /></RequireAuth>} />
        <Route path="/officer/oschemes" element={<RequireAuth allowedRoles={['OFFICER']}><OSchemes /></RequireAuth>} />
        <Route path="/officer/schemes" element={<RequireAuth allowedRoles={['OFFICER']}><OSchemes /></RequireAuth>} />
        <Route path="/officer/ofarms" element={<Navigate to="/officer/farmers" replace />} />
        <Route path="/officer/farms" element={<Navigate to="/officer/farmers" replace />} />
        <Route path="/officer/onification" element={<RequireAuth allowedRoles={['OFFICER']}><ONotification /></RequireAuth>} />
        <Route path="/officer/notifications" element={<RequireAuth allowedRoles={['OFFICER']}><ONotification /></RequireAuth>} />
        <Route path="/officer/oprofile" element={<RequireAuth allowedRoles={['OFFICER']}><OProfile /></RequireAuth>} />
        <Route path="/officer/profile" element={<RequireAuth allowedRoles={['OFFICER']}><OProfile /></RequireAuth>} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<RequireAuth allowedRoles={['ADMIN']}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/dashboard" element={<RequireAuth allowedRoles={['ADMIN']}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/officers" element={<RequireAuth allowedRoles={['ADMIN']}><OfficerVerification /></RequireAuth>} />
        <Route path="/admin/schemes" element={<RequireAuth allowedRoles={['ADMIN']}><AdminSchemes /></RequireAuth>} />
        <Route path="/admin/audit-logs" element={<RequireAuth allowedRoles={['ADMIN']}><AdminAuditLogs /></RequireAuth>} />
        <Route path="/admin/profile" element={<RequireAuth allowedRoles={['ADMIN']}><AdminProfile /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

export default App;
