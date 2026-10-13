const express = require("express");

const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const uploadProfileImage = require("../config/upload");

const {
  getAdminProfile,
  updateAdminProfileImage,
  updateAdminProfile
} = require("../controllers/adminProfileController");

// ==========================================
// GET ADMIN PROFILE
// ==========================================

router.get("/profile", protectAdmin, getAdminProfile);

// ==========================================
// UPDATE ADMIN PROFILE IMAGE
// ==========================================

router.patch(
  "/profile/image",
  protectAdmin,
  uploadProfileImage.single("profileImage"),
  updateAdminProfileImage,
);

// Update admin profile details
router.patch("/profile", protectAdmin, updateAdminProfile);

module.exports = router;
