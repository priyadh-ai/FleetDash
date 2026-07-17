const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["alert", "maintenance", "info", "system", "driver", "fuel"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  severity: {
    type: String,
    enum: ["critical", "warning", "success", "info"],
    default: "info"
  },

  link: {
    type: String,
    default: null
  },

  read: {
    type: Boolean,
    default: false
  },

  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);