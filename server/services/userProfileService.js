const User = require("../models/user");
const Address = require("../models/Address");
const cloudinary = require("../config/cloudinary");

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
  phoneNumber,
  address,
  city,
  state,
  pincode,
} = addressData;

const cleanedPhoneNumber = String(phoneNumber || "").trim();

if (!/^[6-9]\d{9}$/.test(cleanedPhoneNumber)) {
  const error = new Error(
    "Please enter a valid 10-digit Indian mobile number."
  );
  error.statusCode = 400;
  throw error;
}


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
        phoneNumber: cleanedPhoneNumber,

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
  phoneNumber,
  address,
  city,
  state,
  pincode,
} = addressData;

const cleanedPhoneNumber = String(phoneNumber || "").trim();

if (!/^[6-9]\d{9}$/.test(cleanedPhoneNumber)) {
  const error = new Error(
    "Please enter a valid 10-digit Indian mobile number."
  );
  error.statusCode = 400;
  throw error;
}


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
  fullName,
 phoneNumber: cleanedPhoneNumber,
  address,
  city,
  state,
  pincode,
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


const updateProfileImage = async (userId, file) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (!file || !file.path) {
        const error = new Error("Uploaded image URL is missing");
        error.statusCode = 400;
        throw error;
    }

    // Delete the previous Cloudinary image, if applicable.
    if (user.profileImage && user.profileImage.includes("res.cloudinary.com")) {
        try {
            const urlParts = new URL(user.profileImage).pathname.split("/");
            const uploadIndex = urlParts.indexOf("upload");

            if (uploadIndex !== -1) {
                const publicIdParts = urlParts.slice(uploadIndex + 1);

                // Remove an optional Cloudinary transformation/version.
                if (publicIdParts[0]?.startsWith("v") &&
                    /^v\d+$/.test(publicIdParts[0])) {
                    publicIdParts.shift();
                }

                const lastPart = publicIdParts.pop();
                if (lastPart) {
                    publicIdParts.push(lastPart.replace(/\.[^.]+$/, ""));
                }

                const publicId = publicIdParts.join("/");

                if (publicId) {
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: "image",
                    });
                }
            }
        } catch (error) {
            // Keep the new upload working even if old-image cleanup fails.
            console.error("Previous profile image cleanup failed:", error);
        }
    }

    // Cloudinary's secure URL is provided by Multer storage.
    user.profileImage = file.path;
    await user.save();

    return {
        message: "Profile image updated successfully",
        profileImage: user.profileImage,
    };
};


// ==========================================
// REMOVE PROFILE IMAGE
// ==========================================


const removeProfileImage = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Delete from Cloudinary only when the saved URL is a Cloudinary URL.
    if (user.profileImage && user.profileImage.includes("res.cloudinary.com")) {
        const urlParts = new URL(user.profileImage).pathname.split("/");
        const uploadIndex = urlParts.indexOf("upload");

        if (uploadIndex !== -1) {
            const publicIdParts = urlParts.slice(uploadIndex + 1);

            // Remove an optional version segment such as v123456789.
            if (
                publicIdParts[0] &&
                /^v\d+$/.test(publicIdParts[0])
            ) {
                publicIdParts.shift();
            }

            const lastPart = publicIdParts.pop();

            if (lastPart) {
                publicIdParts.push(lastPart.replace(/\.[^.]+$/, ""));
            }

            const publicId = publicIdParts.join("/");

            if (publicId) {
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: "image",
                });
            }
        }
    }

    // Clear the database field, including for legacy local images.
    user.profileImage = "";
    await user.save();

    return {
        message: "Profile image removed successfully",
        profileImage: "",
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