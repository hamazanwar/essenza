const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================================
// ADMIN LOGIN
// ==========================================

const adminLoginService = async ({ email, password }) => {
  // 1. Check required fields
  if (!email || !password) {
    const error = new Error("Email and password are required");

    error.statusCode = 400;

    throw error;
  }

  // 2. Find admin
  const admin = await Admin.findOne({
    email,
  });

  if (!admin) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;

    throw error;
  }

  // 3. Check active status
  if (!admin.isActive) {
    const error = new Error("Admin account is inactive");

    error.statusCode = 403;

    throw error;
  }

  // 4. Compare password
  const isPasswordMatch = await bcrypt.compare(password, admin.password);

  if (!isPasswordMatch) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;

    throw error;
  }

  // 5. Create JWT
  const token = jwt.sign(
    {
      adminId: admin._id,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  // 6. Return result
  return {
    message: "Admin login successful",

    token,

    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

module.exports = {
  adminLoginService,
};
