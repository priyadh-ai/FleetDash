const Vehicle = require("../models/Vehicle");
const { sendUpdate } = require("../socket/socket");
const { generateAlert, generateNotification } = require("../socket/vehicleSocket");
const {
  analyzeMaintenanceNeeds,
  analyzeDriverScore,
  detectFuelFraud
} = require("../services/aiService");

let io;

// Export a function to set io reference
const setIO = (socketIO) => {
  io = socketIO;
};

setInterval(async () => {
  try {
    const vehicles = await Vehicle.find();

    for (const vehicle of vehicles) {
      const prevSpeed = vehicle.speed;
      const prevStatus = vehicle.status;

      // Simulate speed with some variation
      if (vehicle.status === "Active") {
        vehicle.speed = Math.max(0, Math.min(120, vehicle.speed + (Math.random() - 0.5) * 10));
      } else {
        vehicle.speed = Math.max(0, vehicle.speed - 2);
      }

      vehicle.status = vehicle.speed > 0 || (vehicle.status === "Active") ? 
        (vehicle.speed > 0 ? "Active" : "Idle") : 
        (Math.random() > 0.9 ? "Active" : "Offline");

      // Simulate heading (direction of travel)
      vehicle.heading = (vehicle.heading || 0) + (Math.random() - 0.5) * 10;
      if (vehicle.heading < 0) vehicle.heading += 360;
      if (vehicle.heading > 360) vehicle.heading -= 360;

      // Simulate fuel consumption
      if (vehicle.speed > 0) {
        vehicle.fuel = Math.max(0, vehicle.fuel - (Math.random() * 0.5));
      } else if (vehicle.status === "Offline") {
        vehicle.fuel = Math.min(100, vehicle.fuel + 0.1); // Slow refill when offline
      }
      vehicle.distance = (vehicle.distance || 0) + (vehicle.speed * 0.1);

      // Simulate engine temperature
      vehicle.engineTemp = vehicle.speed > 0 
        ? Math.min(120, 85 + (vehicle.speed / 120) * 25 + (Math.random() - 0.5) * 5)
        : Math.max(30, 85 - (Math.random() * 3));

      // Simulate battery drain
      if (vehicle.status === "Active") {
        vehicle.batteryLevel = Math.max(0, (vehicle.batteryLevel || 100) - Math.random() * 0.1);
      }

      // Simulate tire pressure
      vehicle.tirePressure = Math.max(25, Math.min(45, 35 + (Math.random() - 0.5) * 2));

      // Update location with heading-based movement
      if (vehicle.location) {
        const headingRad = (vehicle.heading || 0) * Math.PI / 180;
        const speedFactor = vehicle.speed * 0.00005;
        vehicle.location.lat += Math.cos(headingRad) * speedFactor;
        vehicle.location.lng += Math.sin(headingRad) * speedFactor;
      }

      vehicle.lastUpdated = new Date();

      await vehicle.save();

      // Generate alerts and notifications for critical events
      const alerts = await generateAlert(vehicle);
      for (const alert of alerts) {
        if (io) {
          sendUpdate({
            ...alert.toObject ? alert.toObject() : alert,
            type: alert.type,
            message: alert.message,
            severity: alert.severity,
            vehicleId: alert.vehicleId,
            timestamp: new Date()
          });
          await generateNotification(io, alert);
        }
      }

      // Send vehicle update via socket
      sendUpdate(vehicle);

      // AI Analysis
      try {
        await analyzeMaintenanceNeeds(vehicle);
        await analyzeDriverScore(vehicle);
        await detectFuelFraud(vehicle);
      } catch (aiErr) {
        // AI analysis is non-critical
      }
    }

    // Send analytics update
    sendUpdate({
      type: "analytics_tick",
      timestamp: new Date(),
      vehicleCount: vehicles.length
    });

  } catch (error) {
    console.log("Telemetry Error:", error.message);
  }
}, 5000);

module.exports = { setIO };