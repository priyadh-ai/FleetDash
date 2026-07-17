const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  driver: {
    type: String,
    default: "Unknown",
    trim: true
  },

  phone: {
    type: String,
    default: "+91-9876543210",
    trim: true
  },

  status: {
    type: String,
    enum: ["Active", "Offline", "Idle", "Maintenance"],
    default: "Offline"
  },

  type: {
    type: String,
    enum: ["Truck", "Car", "Bus", "Bike", "Van"],
    default: "Truck"
  },

  speed: {
    type: Number,
    default: 0,
    min: 0
  },

  heading: {
    type: Number,
    default: 0,
    min: 0,
    max: 360
  },

  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },

  fuel: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },

  distance: {
    type: Number,
    default: 0,
    min: 0
  },

  engineTemp: {
    type: Number,
    default: 90
  },

  batteryLevel: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },

  tirePressure: {
    type: Number,
    default: 35
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
vehicleSchema.index({ "location.lat": 1, "location.lng": 1 });

module.exports = mongoose.model("Vehicle", vehicleSchema);