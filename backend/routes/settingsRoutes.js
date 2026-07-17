const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getProfile, updateProfile, changePassword } = require("../controllers/settingsController");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/password", auth, changePassword);

module.exports = router;