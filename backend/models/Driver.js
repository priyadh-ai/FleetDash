const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    trim: true,
    lowercase: true
  },

  phone: {
    type: String,
    trim: true,
    default: ""
  },

  licenseNumber: {
    type: String,
    trim: true
  },

  licenseExpiry: {
    type: Date
  },

  assignedVehicle: {
    type: String,
    default: "Unassigned"
  },

  currentStatus: {
    type: String,
    enum: ["Available", "On Trip", "Off Duty", "On Leave"],
    default: "Available"
  },

  availability: {
    type: Boolean,
    default: true
  },

  experience: {
    type: Number,
    default: 0
  },

  safetyScore: {
    type: Number,
    default: 85,
    min: 0,
    max: 100
  },

  totalTrips: {
    type: Number,
    default: 0
  },

  totalDistance: {
    type: Number,
    default: 0
  },

  violations: {
    type: Number,
    default: 0
  },

  rating: {
    type: String,
    enum: ["Excellent", "Good", "Average", "Risky"],
    default: "Good"
  }
}, {
  timestamps: true
});

driverSchema.index({ name: 1 });
driverSchema.index({ email: 1 }, { sparse: true });
driverSchema.index({ currentStatus: 1 });

module.exports = mongoose.model("Driver", driverSchema);