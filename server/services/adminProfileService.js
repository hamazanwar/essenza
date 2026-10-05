const Admin = require("../models/Admin");

// ==========================================
// GET ADMIN PROFILE
// ==========================================

const getAdminProfileService = async (adminId) => {
  // Find admin
  const admin = await Admin.findById(adminId).select("-password");

  // Check admin
  if (!admin) {
    const error = new Error("Admin not found");

    error.statusCode = 404;

    throw error;
  }

  return {
    message: "Admin profile fetched successfully",
    admin,
  };
};

// ==========================================
// UPDATE ADMIN PROFILE IMAGE
// ==========================================

const updateAdminProfileImageService = async (adminId, imagePath) => {
  // Find admin
  const admin = await Admin.findById(adminId);

  // Check admin
  if (!admin) {
    const error = new Error("Admin not found");

    error.statusCode = 404;

    throw error;
  }

  // Update profile image
  admin.profileImage = imagePath;

  await admin.save();

  return {
    message: "Admin profile image updated successfully",
    profileImage: admin.profileImage,
  };
};

module.exports = {
  getAdminProfileService,
  updateAdminProfileImageService,
};
