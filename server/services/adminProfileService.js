const Admin = require("../models/Admin");
const cloudinary = require("../config/cloudinary");

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


const updateAdminProfileImageService = async (adminId, imagePath, publicId) => {
  const admin = await Admin.findById(adminId);

  if (!admin) {
    const error = new Error("Admin not found");
    error.statusCode = 404;
    throw error;
  }

  // Save the new Cloudinary image URL.
  const previousImage = admin.profileImage;
  admin.profileImage = imagePath;

  await admin.save();

  // Delete the previous Cloudinary image if applicable.
  // Legacy local uploads are left untouched.
  if (previousImage && previousImage.includes("res.cloudinary.com")) {
    try {
      const urlParts = new URL(previousImage).pathname.split("/");
      const uploadIndex = urlParts.indexOf("upload");

      if (uploadIndex !== -1) {
        const parts = urlParts.slice(uploadIndex + 1);

        if (parts[0] && /^v\d+$/.test(parts[0])) {
          parts.shift();
        }

        const lastPart = parts.pop();

        if (lastPart) {
          parts.push(lastPart.replace(/\.[^.]+$/, ""));
        }

        const previousPublicId = parts.join("/");

        if (previousPublicId) {
          await cloudinary.uploader.destroy(previousPublicId, {
            resource_type: "image",
          });
        }
      }
    } catch (error) {
      console.error("Previous admin image cleanup failed:", error);
    }
  }

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
