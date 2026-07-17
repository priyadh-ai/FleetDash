const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "Overspeed",
      "Vehicle Offline",
      "Geofence",
      "Engine Warning",
      "Fuel Theft",
      "Maintenance Due",
      "Battery Low",
      "Critical Temperature",
      "Low Fuel",
      "Tire Pressure",
      "Accident"
    ]
  },

  message: {
    type: String,
    required: true
  },

  severity: {
    type: String,
    required: true,
    enum: ["Critical", "High", "Medium", "Low"],
    default: "Medium"
  },

  vehicleId: {
    type: String,
    required: true
  },

  vehicleRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle"
  },

  acknowledged: {
    type: Boolean,
    default: false
  },

  acknowledgedBy: {
    type: String,
    default: null
  },

  acknowledgedAt: {
    type: Date,
    default: null
  },

  location: {
    lat: { type: Number },
    lng: { type: Number }
  },

  value: {
    type: Number,
    default: null
  },

  resolved: {
    type: Boolean,
    default: false
  },

  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

alertSchema.index({ createdAt: -1 });
alertSchema.index({ vehicleId: 1, createdAt: -1 });
alertSchema.index({ severity: 1, acknowledged: 1 });
alertSchema.index({ type: 1 });

module.exports = mongoose.model("Alert", alertSchema);