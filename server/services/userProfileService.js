const User = require("../models/user");
const Address = require("../models/Address");
const fs = require("fs");
const path = require("path");

// ==========================================
// GET USER PROFILE
// ==========================================

const getUserProfile = async (userId) => {

    const user = await User.findById(userId)
        .select("-password");

    if (!user) {
        const error = new Error("User not found");
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

const updateUserProfile = async (
    userId,
    profileData
) => {

    const { name } = profileData;

    // Check name
    if (!name || !name.trim()) {

        const error = new Error(
            "Name is required"
        );

        error.statusCode = 400;

        throw error;
    }

    // Find user and update name
    const user = await User.findByIdAndUpdate(
        userId,
        {
            name: name.trim()
        },
        {
            new: true
        }
    ).select("-password");

    // User not found
    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return {
        message: "Profile updated successfully",
        user
    };
};


// ==========================================
// ADD USER ADDRESS
// ==========================================

const addUserAddress = async (
    userId,
    addressData
) => {

    const {
        fullName,
        address,
        city,
        state,
        pincode
    } = addressData;


    // Check required fields
    if (
        !fullName ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {
        const error = new Error(
            "Full name, address, city, state and pincode are required"
        );

        error.statusCode = 400;

        throw error;
    }


    // Check whether user already has addresses
    const existingAddress = await Address.find({
        userId
    });


    // First address automatically becomes default
    const isDefault = existingAddress.length === 0;


    // Create address
    const newAddress = await Address.create({

        userId,

        fullName,

        address,

        city,

        state,

        pincode,

        isDefault

    });


    return {
        message: "Address added successfully",
        address: newAddress
    };
};


// ==========================================
// GET USER ADDRESSES
// ==========================================

const getUserAddresses = async (userId) => {

    const addresses = await Address.find({
        userId
    }).sort({
        isDefault: -1,
        createdAt: -1
    });


    return {
        message: "Addresses fetched successfully",
        addresses
    };
};


// ==========================================
// SET DEFAULT ADDRESS
// ==========================================

const setDefaultAddress = async (
    userId,
    addressId
) => {

    // Find the address
    const address = await Address.findOne({
        _id: addressId,
        userId
    });

    // Address does not belong to this user
    if (!address) {

        const error = new Error(
            "Address not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // Remove default from all user's addresses
    await Address.updateMany(
        { userId },
        {
            $set: {
                isDefault: false
            }
        }
    );


    // Make selected address default
    address.isDefault = true;

    await address.save();


    return {
        message: "Default address updated successfully",
        address
    };
};

// ==========================================
// UPDATE USER ADDRESS
// ==========================================

const updateUserAddress = async (
    userId,
    addressId,
    addressData
) => {

    const {
        fullName,
        address,
        city,
        state,
        pincode
    } = addressData;


    // Check required fields
    if (
        !fullName ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {

        const error = new Error(
            "Full name, address, city, state and pincode are required"
        );

        error.statusCode = 400;

        throw error;
    }


    // Find and update address
    const updatedAddress =
        await Address.findOneAndUpdate(
            {
                _id: addressId,
                userId
            },
            {
                fullName: fullName.trim(),
                address: address.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim()
            },
            {
                new: true,
                runValidators: true
            }
        );


    // Address not found
    if (!updatedAddress) {

        const error = new Error(
            "Address not found"
        );

        error.statusCode = 404;

        throw error;
    }


    return {
        message: "Address updated successfully",
        address: updatedAddress
    };
};


// ==========================================
// DELETE USER ADDRESS
// ==========================================

const deleteUserAddress = async (
    userId,
    addressId
) => {

    const address = await Address.findOneAndDelete({
        _id: addressId,
        userId
    });


    if (!address) {

        const error = new Error(
            "Address not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // If deleted address was default,
    // make another address default
    if (address.isDefault) {

        const nextAddress = await Address.findOne({
            userId
        }).sort({
            createdAt: 1
        });


        if (nextAddress) {

            nextAddress.isDefault = true;

            await nextAddress.save();

        }
    }


    return {
        message: "Address deleted successfully"
    };
};

// ==========================================
// UPDATE PROFILE IMAGE
// ==========================================

const updateProfileImage = async (
    userId,
    file
) => {

    const user = await User.findById(userId);

    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // Delete old profile image
    if (user.profileImage) {

        const oldImagePath =
            path.join(
                __dirname,
                "..",
                user.profileImage.replace(
                    "/uploads/",
                    "uploads/"
                )
            );

        if (fs.existsSync(oldImagePath)) {

            fs.unlinkSync(oldImagePath);

        }

    }


    // Save new image path
    user.profileImage =
        `/uploads/profile/${file.filename}`;

    await user.save();


    return {
        message: "Profile image updated successfully",
        profileImage: user.profileImage
    };

};

// ==========================================
// REMOVE PROFILE IMAGE
// ==========================================

const removeProfileImage = async (
    userId
) => {

    const user = await User.findById(userId);

    if (!user) {

        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // Delete image from server
    if (user.profileImage) {

        const imagePath =
            path.join(
                __dirname,
                "..",
                user.profileImage.replace(
                    "/uploads/",
                    "uploads/"
                )
            );

        if (fs.existsSync(imagePath)) {

            fs.unlinkSync(imagePath);

        }

    }


    // Remove image path from database
    user.profileImage = "";

    await user.save();


    return {
        message: "Profile image removed successfully",
        profileImage: ""
    };

};


module.exports = {

    getUserProfile,

    addUserAddress,

    getUserAddresses,

    deleteUserAddress,
    updateUserProfile,
    setDefaultAddress,
    updateUserAddress,
    updateProfileImage,
    removeProfileImage

};