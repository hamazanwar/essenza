const {
  getAdminProfileService,
  updateAdminProfileImageService,
  updateAdminProfileService
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

   // Cloudinary image URL
const imagePath = req.file.path;

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

// ==========================================
// UPDATE ADMIN PROFILE DETAILS
// ==========================================

const updateAdminProfile = async (req, res) => {
  try {
    const result = await updateAdminProfileService(
      req.admin.adminId,
      { name: req.body.name }
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Server error",
    });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfileImage,
  updateAdminProfile
};
