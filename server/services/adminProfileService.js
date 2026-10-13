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

// ==========================================
// UPDATE ADMIN PROFILE DETAILS
// ==========================================

const updateAdminProfileService = async (adminId, { name }) => {
  if (typeof name !== "string" || !name.trim()) {
    const error = new Error("Name is required.");
    error.statusCode = 400;
    throw error;
  }

  if (name.trim().length > 100) {
    const error = new Error("Name must be 100 characters or fewer.");
    error.statusCode = 400;
    throw error;
  }

  const admin = await Admin.findById(adminId);

  if (!admin) {
    const error = new Error("Admin not found.");
    error.statusCode = 404;
    throw error;
  }

  admin.name = name.trim();

  await admin.save();

  const updatedAdmin = await Admin.findById(adminId).select("-password");

  return {
    message: "Admin profile updated successfully.",
    admin: updatedAdmin,
  };
};

module.exports = {
  getAdminProfileService,
  updateAdminProfileImageService,
  updateAdminProfileService
};
