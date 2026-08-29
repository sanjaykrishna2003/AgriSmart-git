/**
 * AgriSmart Frontend API Service Layer
 * Centralised module — all fetch calls should go through these helpers.
 */

export const API = {
  USER:      import.meta.env.VITE_USER_API      || "http://localhost:8081",
  FARM:      import.meta.env.VITE_FARM_API      || "http://localhost:8082",
  CROP:      import.meta.env.VITE_CROP_API      || "http://localhost:8083",
  WEATHER:   import.meta.env.VITE_WEATHER_API   || "http://localhost:8084",
  ANALYTICS: import.meta.env.VITE_ANALYTICS_API || "http://localhost:8085",
  AI:        import.meta.env.VITE_AI_API        || "http://localhost:8086",
  ML:        import.meta.env.VITE_ML_API        || "http://localhost:8000",
};

/** Build standard auth headers */
export const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

/** Build JSON + auth headers */
export const jsonHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ─── Generic request helper ────────────────────────────────────────────────

async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: res.statusText }));
      const msg = errData.detail
        ? (typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail))
        : (errData.message || `HTTP ${res.status}`);
      const err = new Error(msg);
      err.status = res.status;
      err.data = errData;
      throw err;
    }
    // Some endpoints return empty body (204 No Content)
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (e) {
    if (e.message === "UNAUTHORIZED") throw e;
    throw e;
  }
}

// ─── Document API ──────────────────────────────────────────────────────────

export const documentApi = {
  /** Farmer: upload a document (multipart) */
  upload: async (token, documentType, file) => {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);
    const res = await fetch(`${API.USER}/api/documents/upload`, {
      method: "POST",
      headers: authHeaders(token),
      body: formData,
    });
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Upload failed");
    }
    return res.json();
  },

  /** Farmer: get own documents */
  getMyDocuments: (token) =>
    request(`${API.USER}/api/documents/my`, { headers: authHeaders(token) }),

  /** Officer/Admin: get all farmer documents */
  getAllDocuments: (token) =>
    request(`${API.USER}/api/documents/all`, { headers: authHeaders(token) }),

  /** Officer: get documents for a specific farmer */
  getUserDocuments: (token, userId) =>
    request(`${API.USER}/api/documents/user/${userId}`, { headers: authHeaders(token) }),

  /** Authenticated: download — returns blob URL */
  getDownloadUrl: (documentId) =>
    `${API.USER}/api/documents/${documentId}/download`,

  /** Authenticated download as blob */
  download: async (token, documentId, filename) => {
    const res = await fetch(`${API.USER}/api/documents/${documentId}/download`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /** Officer: verify or reject a document */
  verify: (token, documentId, status, remarks = "") =>
    request(
      `${API.USER}/api/documents/${documentId}/verify?status=${encodeURIComponent(status)}&remarks=${encodeURIComponent(remarks)}`,
      { method: "PUT", headers: authHeaders(token) }
    ),

  /** Farmer: delete own document */
  delete: (token, documentId) =>
    request(`${API.USER}/api/documents/${documentId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};

// ─── User / Auth API ───────────────────────────────────────────────────────

export const userApi = {
  getProfile: (token) =>
    request(`${API.USER}/api/users/profile`, { headers: authHeaders(token) }),

  updateProfile: (token, payload) =>
    request(`${API.USER}/api/users/profile`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }),

  getSoilHealth: (token) =>
    request(`${API.USER}/api/users/soil-health`, { headers: authHeaders(token) }),

  getAllUsers: (token) =>
    request(`${API.USER}/api/users`, { headers: authHeaders(token) }),

  getAllFarmers: (token) =>
    request(`${API.USER}/api/users/farmers`, { headers: authHeaders(token) }),

  getAllOfficers: (token) =>
    request(`${API.USER}/api/users/officers`, { headers: authHeaders(token) }),

  verifyOfficer: (token, userId, verified = true) =>
    request(`${API.USER}/api/users/officers/${userId}/verify?verified=${verified}`, {
      method: "PUT",
      headers: authHeaders(token),
    }),

  assignOfficerRegion: (token, userId, payload) =>
    request(`${API.USER}/api/users/officers/${userId}/assignment`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }),

  getUserById: (token, userId) =>
    request(`${API.USER}/api/users/${userId}`, { headers: authHeaders(token) }),
};

// ─── AI / ML API ────────────────────────────────────────────────────────────

export const aiApi = {
  /** Get AI Fertilizer & Irrigation Advisory */
  getRecommendation: (token, farmId, cropId) =>
    request(`${API.AI}/api/ai/recommendation`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify({ farmId, cropId }),
    }),

  /** Get ML Crop Recommendation */
  getCropRecommendation: (payload) =>
    request(`${API.ML}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};

// ─── Farm API ──────────────────────────────────────────────────────────────

export const farmApi = {
  getAllFarms: (token) =>
    request(`${API.FARM}/api/farms`, { headers: authHeaders(token) }),

  getFarmsByUser: (token, userId) =>
    request(`${API.FARM}/api/farms?userId=${userId}`, { headers: authHeaders(token) }),

  getFarmById: (token, farmId) =>
    request(`${API.FARM}/api/farms/${farmId}`, { headers: authHeaders(token) }),

  updateFarm: (token, farmId, data) =>
    request(`${API.FARM}/api/farms/${farmId}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  deleteFarm: (token, farmId) =>
    request(`${API.FARM}/api/farms/${farmId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};

// ─── Crop API ──────────────────────────────────────────────────────────────

export const cropApi = {
  getAllCrops: (token) =>
    request(`${API.CROP}/api/crops?size=1000`, { headers: authHeaders(token) }),
};

// ─── Analytics API ────────────────────────────────────────────────────────

export const analyticsApi = {
  getOfficerAnalytics: (token) =>
    request(`${API.ANALYTICS}/api/analytics/officer`, { headers: authHeaders(token) }),

  getFarmerAnalytics: (token) =>
    request(`${API.ANALYTICS}/api/analytics/farmer`, { headers: authHeaders(token) }),
};

// ─── Schemes API ──────────────────────────────────────────────────────────

export const schemeApi = {
  getAllSchemes: (token) =>
    request(`${API.ANALYTICS}/api/schemes`, { headers: authHeaders(token) }),

  getRecommendedSchemes: (token) =>
    request(`${API.ANALYTICS}/api/schemes/recommend`, { headers: authHeaders(token) }),

  createScheme: (token, payload) =>
    request(`${API.ANALYTICS}/api/schemes`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }),

  updateScheme: (token, schemeId, payload) =>
    request(`${API.ANALYTICS}/api/schemes/${schemeId}`, {
      method: "PUT",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteScheme: (token, schemeId) =>
    request(`${API.ANALYTICS}/api/schemes/${schemeId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  applyToScheme: (token, schemeId) =>
    request(`${API.ANALYTICS}/api/schemes/apply?schemeId=${schemeId}`, {
      method: "POST",
      headers: authHeaders(token),
    }),

  withdrawApplication: (token, schemeId) =>
    request(`${API.ANALYTICS}/api/schemes/withdraw?schemeId=${schemeId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  getMyApplications: (token) =>
    request(`${API.ANALYTICS}/api/schemes/applications/me`, { headers: authHeaders(token) }),

  getAllApplications: (token) =>
    request(`${API.ANALYTICS}/api/schemes/applications`, { headers: authHeaders(token) }),

  getUserApplications: (token, userId) =>
    request(`${API.ANALYTICS}/api/schemes/applications/user/${userId}`, {
      headers: authHeaders(token),
    }),

  updateApplicationStatus: (token, applicationId, status) =>
    request(
      `${API.ANALYTICS}/api/schemes/applications/${applicationId}/status?status=${status}`,
      { method: "PUT", headers: authHeaders(token) }
    ),
};

// ─── Notification API ────────────────────────────────────────────────────

export const notificationApi = {
  getAllNotifications: (token) =>
    request(`${API.ANALYTICS}/api/notifications`, { headers: authHeaders(token) }),

  createNotification: (token, payload) =>
    request(`${API.ANALYTICS}/api/notifications`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteNotification: (token, id) =>
    request(`${API.ANALYTICS}/api/notifications/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};

// ─── Admin API ─────────────────────────────────────────────────────────────

export const adminApi = {
  getAuditLogs: (token) =>
    request(`${API.USER}/api/audit-logs`, { headers: authHeaders(token) }),
};

// ─── Event API ─────────────────────────────────────────────────────────────

export const eventApi = {
  getAllEvents: (token) =>
    request(`${API.ANALYTICS}/api/events`, { headers: authHeaders(token) }),

  createEvent: (token, payload) =>
    request(`${API.ANALYTICS}/api/events`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }),

  deleteEvent: (token, id) =>
    request(`${API.ANALYTICS}/api/events/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  registerForEvent: (token, id, payload) =>
    request(`${API.ANALYTICS}/api/events/${id}/register`, {
      method: "POST",
      headers: jsonHeaders(token),
      body: JSON.stringify(payload),
    }),

  getEventRegistrations: (token, id) =>
    request(`${API.ANALYTICS}/api/events/${id}/registrations`, {
      headers: authHeaders(token),
    }),

  getMyRegistrations: (token) =>
    request(`${API.ANALYTICS}/api/events/registrations/my`, {
      headers: authHeaders(token),
    }),
};

