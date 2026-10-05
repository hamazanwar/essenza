const {
  getAdminProfileService,
  updateAdminProfileImageService,
} = require("../services/adminProfileService");

// ==========================================
// GET ADMIN PROFILE
// ==========================================

const getAdminProfile = async (req, res) => {
  try {
    const result = await getAdminProfileService(req.admin.adminId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Get admin profile error:", error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

// ==========================================
// UPDATE ADMIN PROFILE IMAGE
// ==========================================

const updateAdminProfileImage = async (req, res) => {
  try {
    // Check uploaded image
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a profile image",
      });
    }

    // Create image path
    const imagePath = `/uploads/profile/${req.file.filename}`;

    const result = await updateAdminProfileImageService(
      req.admin.adminId,
      imagePath,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Update admin profile image error:", error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfileImage,
};
