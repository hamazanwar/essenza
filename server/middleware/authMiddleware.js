const jwt = require("jsonwebtoken");
const User = require("../models/user"); 

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support common JWT user ID field names
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    // Always retrieve the latest account status from MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please log in again.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account is inactive. Please contact support.",
      });
    }

    req.user = {
      ...decoded,
      userId: user._id.toString(),
    };

    req.customer = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      message: "Authentication failed. Please try again.",
    });
  }
};

module.exports = protect;