const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  acknowledgeAll,
  resolveAlert,
  deleteAlert,
  getAlertStats
} = require("../controllers/alertController");

router.get("/", auth, getAlerts);
router.get("/stats/summary", auth, getAlertStats);
router.get("/:id", auth, getAlertById);
router.put("/:id/acknowledge", auth, acknowledgeAlert);
router.put("/acknowledge-all", auth, acknowledgeAll);
router.put("/:id/resolve", auth, resolveAlert);
router.delete("/:id", auth, deleteAlert);

module.exports = router;