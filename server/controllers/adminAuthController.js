const {
    adminLoginService
} = require("../services/adminAuthService");


// ==========================================
// ADMIN LOGIN
// ==========================================

const adminLogin = async (req, res) => {
    try {

        const result =
            await adminLoginService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};


module.exports = {
    adminLogin
};