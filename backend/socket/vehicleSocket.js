const Alert = require("../models/Alert");
const Notification = require("../models/Notification");

// Generate alert from vehicle update data
const generateAlert = async (vehicleData) => {
  const alerts = [];
  
  if (vehicleData.speed > 80 && vehicleData.status === "Active") {
    alerts.push({
      type: "Overspeed",
      message: `${vehicleData.vehicleId} overspeeding at ${vehicleData.speed} km/h`,
      severity: "Critical",
      vehicleId: vehicleData.vehicleId,
      value: vehicleData.speed
    });
  }

  if (vehicleData.status === "Offline" && vehicleData.speed === 0) {
    alerts.push({
      type: "Vehicle Offline",
      message: `${vehicleData.vehicleId} is offline`,
      severity: "High",
      vehicleId: vehicleData.vehicleId
    });
  }

  if (vehicleData.fuel < 15) {
    alerts.push({
      type: "Low Fuel",
      message: `${vehicleData.vehicleId} fuel level critically low at ${Math.round(vehicleData.fuel)}%`,
      severity: "High",
      vehicleId: vehicleData.vehicleId,
      value: vehicleData.fuel
    });
  }

  if (vehicleData.batteryLevel < 20) {
    alerts.push({
      type: "Battery Low",
      message: `${vehicleData.vehicleId} battery level at ${Math.round(vehicleData.batteryLevel)}%`,
      severity: "Medium",
      vehicleId: vehicleData.vehicleId,
      value: vehicleData.batteryLevel
    });
  }

  if (vehicleData.engineTemp > 110) {
    alerts.push({
      type: "Critical Temperature",
      message: `${vehicleData.vehicleId} engine temperature critical at ${vehicleData.engineTemp}°C`,
      severity: "Critical",
      vehicleId: vehicleData.vehicleId,
      value: vehicleData.engineTemp
    });
  }

  for (const alertData of alerts) {
    try {
      const existing = await Alert.findOne({
        vehicleId: alertData.vehicleId,
        type: alertData.type,
        acknowledged: false
      });

      if (!existing) {
        await Alert.create(alertData);
      }
    } catch (err) {
      console.error("Error saving alert:", err.message);
    }
  }

  return alerts;
};

// Generate notification for users
const generateNotification = async (io, alert) => {
  try {
    // Fetch all users and create notifications
    const User = require("../models/User");
    const users = await User.find({}, "_id");

    for (const user of users) {
      await Notification.create({
        userId: user._id,
        type: "alert",
        message: alert.message,
        severity: alert.severity === "Critical" ? "critical" : alert.severity === "High" ? "warning" : "info"
      });
    }

    // Emit to all connected clients
    io.emit("notification", alert);
  } catch (err) {
    console.error("Error creating notification:", err.message);
  }
};

module.exports = { generateAlert, generateNotification };