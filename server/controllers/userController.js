const {
    createTestUserService,
    getProfileService
} = require("../services/userService");


// ==========================================
// CREATE TEST USER
// ==========================================

const createTestUser = async (req, res) => {
    try {

        const result =
            await createTestUserService();

        res.status(201).json(result);

    } catch (error) {

        console.error(
            "Create test user error:",
            error
        );

        res.status(500).json({
            message: "Failed to create test user",
            error: error.message
        });
    }
};


// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {
    try {

        const result =
            await getProfileService(
                req.user.userId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get profile error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Failed to fetch profile"
        });
    }
};


module.exports = {
    createTestUser,
    getProfile
};