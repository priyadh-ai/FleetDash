import API from "../api/axios";

// ===================== AUTH API =====================

export const authAPI = {
  login: (credentials) => API.post("/auth/login", credentials),
  register: (userData) => API.post("/users/create", userData),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (resetToken, password) => API.put(`/auth/reset-password/${resetToken}`, { password }),
};

// ===================== DRIVERS API =====================

export const driversAPI = {
  getAll: (params) => API.get("/drivers", { params }),
  getById: (id) => API.get(`/drivers/${id}`),
  create: (data) => API.post("/drivers", data),
  update: (id, data) => API.put(`/drivers/${id}`, data),
  delete: (id) => API.delete(`/drivers/${id}`),
};

// ===================== VEHICLES API =====================

export const vehiclesAPI = {
  getAll: () => API.get("/vehicles"),
  getById: (id) => API.get(`/vehicles/${id}`),
  create: (vehicleData) => API.post("/vehicles", vehicleData),
  update: (id, vehicleData) => API.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => API.delete(`/vehicles/${id}`),
};

// ===================== ALERTS API =====================

export const alertsAPI = {
  getAll: (params) => API.get("/alerts", { params }),
  getById: (id) => API.get(`/alerts/${id}`),
  acknowledge: (id, userName) => API.put(`/alerts/${id}/acknowledge`, { userName }),
  acknowledgeAll: (userName) => API.put("/alerts/acknowledge-all", { userName }),
  resolve: (id) => API.put(`/alerts/${id}/resolve`),
  delete: (id) => API.delete(`/alerts/${id}`),
  getStats: () => API.get("/alerts/stats/summary"),
};

// ===================== NOTIFICATIONS API =====================

export const notificationsAPI = {
  getAll: (params) => API.get("/notifications", { params }),
  getUnreadCount: () => API.get("/notifications/unread-count"),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put("/notifications/read-all"),
  delete: (id) => API.delete(`/notifications/${id}`),
};

// ===================== AI API =====================

export const aiAPI = {
  getMaintenance: (vehicleId) => API.get(`/ai/maintenance${vehicleId ? `?vehicleId=${vehicleId}` : ""}`),
  runAnalysis: () => API.post("/ai/maintenance/analyze"),
  updateMaintenanceStatus: (id, status) => API.put(`/ai/maintenance/${id}/status`, { status }),
  getAllHealthCards: () => API.get("/ai/health"),
  getVehicleHealthCard: (id) => API.get(`/ai/health/${id}`),
  getDriverScores: () => API.get("/ai/drivers"),
  getDriverLeaderboard: () => API.get("/ai/drivers/leaderboard"),
  optimizeRoute: (data) => API.post("/ai/route/optimize", data),
  getFuelRecords: (vehicleId) => API.get(`/ai/fuel${vehicleId ? `?vehicleId=${vehicleId}` : ""}`),
  getFuelFraudAlerts: () => API.get("/ai/fuel/fraud"),
  getGeofenceZones: () => API.get("/ai/geofence"),
  createGeofenceZone: (data) => API.post("/ai/geofence", data),
  deleteGeofenceZone: (id) => API.delete(`/ai/geofence/${id}`),
  getDailyReport: () => API.get("/ai/report"),
  downloadPDF: () => API.get("/ai/report/pdf", { responseType: "blob" }),
  downloadExcel: () => API.get("/ai/report/excel", { responseType: "blob" }),
  getFleetAnalytics: () => API.get("/ai/analytics"),
  getAuditLogs: (params) => API.get("/ai/audit", { params }),
  voiceCommand: (command) => API.post("/ai/voice", { command }),
};

// ===================== ADMIN API =====================

export const adminAPI = {
  getUsers: () => API.get("/users"),
  createUser: (data) => API.post("/users/create", data),
  updateUser: (id, data) => API.put(`/users/${id}`, data),
  deleteUser: (id) => API.delete(`/users/${id}`),
  getSystemHealth: () => API.get("/health"),
};