const express = require("express");

const router = express.Router();

const {
    createTestUser,
    getProfile
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

router.post("/test-user", createTestUser);

router.get("/profile", protect, getProfile);

module.exports = router;