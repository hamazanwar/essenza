const express = require("express");

const router = express.Router();

const {
    createTestUser,
    getProfile
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const { changePassword } = require("../controllers/authController");

router.post("/test-user", createTestUser);

router.get("/profile", protect, getProfile);

router.patch("/change-password", protect, changePassword);

module.exports = router;