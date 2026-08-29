import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import 'react-toastify/dist/ReactToastify.css';
import './index.css'
import App from './App.jsx'
import "./sankari.css";

const initialAgriState = {
  user: null,
  usersList: [],
  token: localStorage.getItem('token') || '',
  demoMode: !localStorage.getItem('token'),
  apiOnline: false,
  farms: [],
  crops: [],
  weather: null,
  forecast: [],
  weatherHistory: [],
  analytics: null,
  schemes: [],
  appliedSchemeIds: JSON.parse(localStorage.getItem('appliedSchemeIds') || '[]'),
  possessedDocs: JSON.parse(localStorage.getItem('possessedDocs') || '[]'),
  documents: [],            // farmer uploaded documents from backend
  broadcastNotifications: JSON.parse(localStorage.getItem('broadcast_notifications') || '[]'),
  chatMessages: [
    { sender: 'bot', text: 'Hello! I am your AgriSmart AI Chatbot. How can I assist you with your farming today? (Available in English, Hindi, Punjabi, Telugu, and Tamil)', time: 'Just now' }
  ],
  chatLanguage: 'en'
};

const agriSlice = createSlice({
  name: 'agri',
  initialState: initialAgriState,
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    setUsersList: (state, action) => { state.usersList = action.payload; },
    setToken: (state, action) => { 
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    setDemoMode: (state, action) => { state.demoMode = action.payload; },
    setApiOnline: (state, action) => { state.apiOnline = action.payload; },
    setFarms: (state, action) => { state.farms = action.payload; },
    addFarmAction: (state, action) => {
      state.farms.push(action.payload);
    },
    updateFarmAction: (state, action) => {
      state.farms = state.farms.map(f => f.farmId === action.payload.farmId ? action.payload : f);
    },
    deleteFarmAction: (state, action) => {
      state.farms = state.farms.filter(f => f.farmId !== action.payload);
      state.crops = state.crops.filter(c => c.farmId !== action.payload);
    },
    setCrops: (state, action) => { state.crops = action.payload; },
    addCropAction: (state, action) => {
      state.crops.push(action.payload);
    },
    updateCropAction: (state, action) => {
      state.crops = state.crops.map(c => c.cropId === action.payload.cropId ? action.payload : c);
    },
    setWeather: (state, action) => { state.weather = action.payload; },
    setForecast: (state, action) => { state.forecast = action.payload; },
    setWeatherHistory: (state, action) => { state.weatherHistory = action.payload; },
    setAnalytics: (state, action) => { state.analytics = action.payload; },
    setSchemes: (state, action) => { state.schemes = action.payload; },
    setDocuments: (state, action) => { state.documents = action.payload; },
    setAppliedSchemeIds: (state, action) => {
      state.appliedSchemeIds = action.payload;
      localStorage.setItem('appliedSchemeIds', JSON.stringify(action.payload));
    },
    toggleApplySchemeAction: (state, action) => {
      const schemeId = action.payload;
      if (state.appliedSchemeIds.includes(schemeId)) {
        state.appliedSchemeIds = state.appliedSchemeIds.filter(id => id !== schemeId);
      } else {
        state.appliedSchemeIds.push(schemeId);
      }
      localStorage.setItem('appliedSchemeIds', JSON.stringify(state.appliedSchemeIds));
    },
    togglePossessedDocAction: (state, action) => {
      const doc = action.payload;
      if (state.possessedDocs.includes(doc)) {
        state.possessedDocs = state.possessedDocs.filter(d => d !== doc);
      } else {
        state.possessedDocs.push(doc);
      }
      localStorage.setItem('possessedDocs', JSON.stringify(state.possessedDocs));
    },
    setBroadcastNotifications: (state, action) => { 
      state.broadcastNotifications = action.payload;
      localStorage.setItem('broadcast_notifications', JSON.stringify(action.payload));
    },
    addBroadcastNotificationAction: (state, action) => {
      state.broadcastNotifications.push(action.payload);
      localStorage.setItem('broadcast_notifications', JSON.stringify(state.broadcastNotifications));
    },
    deleteBroadcastNotificationAction: (state, action) => {
      state.broadcastNotifications = state.broadcastNotifications.filter(n => n.id !== action.payload);
      localStorage.setItem('broadcast_notifications', JSON.stringify(state.broadcastNotifications));
    },
    setChatMessages: (state, action) => { state.chatMessages = action.payload; },
    addChatMessage: (state, action) => { state.chatMessages.push(action.payload); },
    setChatLanguage: (state, action) => { state.chatLanguage = action.payload; },
    logout: (state) => {
      state.user = null;
      state.token = '';
      state.demoMode = true;
      state.farms = [];
      state.crops = [];
      state.weather = null;
      state.forecast = [];
      state.weatherHistory = [];
      state.analytics = null;
      localStorage.removeItem('token');
    }
  }
});

export const {
  setUser,
  setUsersList,
  setToken,
  setDemoMode,
  setApiOnline,
  setFarms,
  addFarmAction,
  updateFarmAction,
  deleteFarmAction,
  setCrops,
  addCropAction,
  updateCropAction,
  setWeather,
  setForecast,
  setWeatherHistory,
  setAnalytics,
  setSchemes,
  setDocuments,
  setAppliedSchemeIds,
  toggleApplySchemeAction,
  togglePossessedDocAction,
  setBroadcastNotifications,
  addBroadcastNotificationAction,
  deleteBroadcastNotificationAction,
  setChatMessages,
  addChatMessage,
  setChatLanguage,
  logout
} = agriSlice.actions;

export const store = configureStore({
  reducer: {
    agri: agriSlice.reducer
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
