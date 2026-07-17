const express = require("express");
const router = express.Router();

const {
    login,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.put("/reset-password/:resetToken", resetPassword);

module.exports = router;