require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// ===================== API ROUTES =====================

// Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// User Routes
app.use("/api/users", require("./routes/userRoutes"));

// Vehicle Routes
app.use("/api/vehicles", require("./routes/vehicleRoutes"));

// AI Routes (includes maintenance, health, drivers, route, fuel, geofence, reports, analytics, audit, voice)
app.use("/api/ai", require("./routes/aiRoutes"));

// Driver Routes
app.use("/api/drivers", require("./routes/driverRoutes"));

// Settings Routes
app.use("/api/settings", require("./routes/settingsRoutes"));

// Alert Routes
app.use("/api/alerts", require("./routes/alertRoutes"));

// Notification Routes
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start telemetry worker for real-time data simulation
require("./workers/telemetryWorker");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`FleetDash Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});