const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } = require("../controllers/driverController");

router.get("/", auth, getDrivers);
router.get("/:id", auth, getDriverById);
router.post("/", auth, createDriver);
router.put("/:id", auth, updateDriver);
router.delete("/:id", auth, deleteDriver);

module.exports = router;