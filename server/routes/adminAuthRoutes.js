const express = require("express");

const router = express.Router();

const {
    adminLogin
} = require("../controllers/adminAuthController");

// Admin login
router.post("/login", adminLogin);

module.exports = router;