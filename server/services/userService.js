const User = require("../models/user");
const bcrypt = require("bcrypt");

// ==========================================
// CREATE TEST USER
// ==========================================

const createTestUserService = async () => {

    const password = "testpassword123";

    // Hash password
    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    // Create user
    const user = await User.create({
        name: "Essenza Test User",
        email: "test2@essenza.com",
        password: hashedPassword
    });

    return {
        message: "Test user created successfully",
        user
    };
};


// ==========================================
// GET USER PROFILE
// ==========================================

const getProfileService = async (userId) => {

    const user = await User.findById(userId)
        .select("-password");

    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return {
        message: "Profile fetched successfully",
        user
    };
};


// ==========================================
// UPDATE USER PROFILE
// ==========================================

const updateProfileService = async (
    userId,
    name,
    email,
    profileImage
) => {

    const user = await User.findById(userId);

    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // ==========================================
    // UPDATE NAME
    // ==========================================

    if (name !== undefined) {
        user.name = name.trim();
    }


    // ==========================================
    // UPDATE EMAIL
    // ==========================================

    if (email !== undefined) {

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: userId }
        });

        if (existingUser) {

            const error = new Error(
                "Email already registered"
            );

            error.statusCode = 409;

            throw error;
        }

        user.email = email.toLowerCase().trim();
    }


    // ==========================================
    // UPDATE PROFILE IMAGE
    // ==========================================

    if (profileImage !== undefined) {
        user.profileImage = profileImage;
    }


    await user.save();


    // Don't send password to frontend
    const updatedUser = await User.findById(userId)
        .select("-password");


    return {
        message: "Profile updated successfully",
        user: updatedUser
    };
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createTestUserService,

    getProfileService,

    updateProfileService

};