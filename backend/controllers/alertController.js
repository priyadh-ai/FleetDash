const Alert = require("../models/Alert");

// @desc    Get all alerts with filtering and pagination
// @route   GET /api/alerts
exports.getAlerts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      severity, 
      type, 
      acknowledged, 
      vehicleId,
      startDate,
      endDate,
      sort = "-createdAt"
    } = req.query;

    const filter = {};

    if (severity && severity !== "All") filter.severity = severity;
    if (type && type !== "All") filter.type = type;
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === "true";
    if (vehicleId) filter.vehicleId = { $regex: vehicleId, $options: "i" };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const total = await Alert.countDocuments(filter);
    const alerts = await Alert.find(filter)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      alerts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      unacknowledged: await Alert.countDocuments({ acknowledged: false })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get alert by ID
// @route   GET /api/alerts/:id
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Acknowledge an alert
// @route   PUT /api/alerts/:id/acknowledge
exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        acknowledged: true,
        acknowledgedBy: req.body.userName || "System",
        acknowledgedAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Acknowledge all alerts
// @route   PUT /api/alerts/acknowledge-all
exports.acknowledgeAll = async (req, res) => {
  try {
    const result = await Alert.updateMany(
      { acknowledged: false },
      {
        acknowledged: true,
        acknowledgedBy: req.body.userName || "System",
        acknowledgedAt: new Date()
      }
    );
    res.json({ message: `${result.modifiedCount} alerts acknowledged` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve an alert
// @route   PUT /api/alerts/:id/resolve
exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an alert
// @route   DELETE /api/alerts/:id
exports.deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.json({ message: "Alert deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get alert statistics
// @route   GET /api/alerts/stats/summary
exports.getAlertStats = async (req, res) => {
  try {
    const [severityStats, typeStats, totalAlerts, unacknowledged] = await Promise.all([
      Alert.aggregate([
        { $group: { _id: "$severity", count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]),
      Alert.countDocuments(),
      Alert.countDocuments({ acknowledged: false })
    ]);

    res.json({
      total: totalAlerts,
      unacknowledged,
      bySeverity: severityStats,
      byType: typeStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};