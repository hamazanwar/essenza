const userProfileService = require("../services/userProfileService");



// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {

    try {

        const result =
            await userProfileService.getUserProfile(
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
                error.message ||
                "Failed to fetch profile"
        });
    }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (req, res) => {

    try {

        const result =
            await userProfileService.updateUserProfile(
                req.user.userId,
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to update profile"
        });
    }
};


// ==========================================
// ADD ADDRESS
// ==========================================

const addUserAddress = async (req, res) => {

    try {

        const result =
            await userProfileService.addUserAddress(
                req.user.userId,
                req.body
            );

        res.status(201).json(result);

    } catch (error) {

        console.error(
            "Add address error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to add address"
        });
    }
};


// ==========================================
// GET ADDRESSES
// ==========================================

const getUserAddresses = async (req, res) => {

    try {

        const result =
            await userProfileService.getUserAddresses(
                req.user.userId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get addresses error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to fetch addresses"
        });
    }
};


// ==========================================
// SET DEFAULT ADDRESS
// ==========================================

const setDefaultAddress = async (req, res) => {

    try {

        const result =
            await userProfileService.setDefaultAddress(
                req.user.userId,
                req.params.addressId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Set default address error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to set default address"
        });
    }
};

// ==========================================
// UPDATE ADDRESS
// ==========================================

const updateUserAddress = async (req, res) => {

    try {

        const result =
            await userProfileService.updateUserAddress(
                req.user.userId,
                req.params.addressId,
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Update address error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to update address"
        });
    }
};

// ==========================================
// DELETE ADDRESS
// ==========================================

const deleteUserAddress = async (req, res) => {

    try {

        const result =
            await userProfileService.deleteUserAddress(
                req.user.userId,
                req.params.addressId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Delete address error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to delete address"
        });
    }
};

// ==========================================
// UPLOAD PROFILE IMAGE
// ==========================================

const uploadProfileImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                message: "Please select an image"
            });

        }

        const result =
            await userProfileService.updateProfileImage(
                req.user.userId,
                req.file
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Upload profile image error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to upload profile image"
        });

    }

};


// ==========================================
// REMOVE PROFILE IMAGE
// ==========================================

const removeProfileImage = async (req, res) => {

    try {

        const result =
            await userProfileService.removeProfileImage(
                req.user.userId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Remove profile image error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to remove profile image"
        });

    }

};


module.exports = {

    getProfile,

    addUserAddress,

    getUserAddresses,

    deleteUserAddress,
    updateProfile,
    setDefaultAddress,
    updateUserAddress,
    uploadProfileImage,
    removeProfileImage

};