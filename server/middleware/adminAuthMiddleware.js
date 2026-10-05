const jwt = require("jsonwebtoken");

const protectAdmin = (req, res, next) => {
    try {
        // 1. Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token is required"
            });
        }

        // 2. Check Bearer format
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }

        // 3. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Check admin role
        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        // 5. Store admin information in request
        req.admin = decoded;

        // 6. Continue to next middleware/controller
        next();

    } catch (error) {
        console.error("Admin authentication error:", error);

        return res.status(401).json({
            message: "Invalid or expired admin token"
        });
    }
};

module.exports = protectAdmin;