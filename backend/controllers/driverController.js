const Driver = require("../models/Driver");

// @desc    Get all drivers
// @route   GET /api/drivers
exports.getDrivers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (status && status !== "All") filter.currentStatus = status;

    const total = await Driver.countDocuments(filter);
    const drivers = await Driver.find(filter)
      .sort("-createdAt")
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ drivers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create driver
// @route   POST /api/drivers
exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};