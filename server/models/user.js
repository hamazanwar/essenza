const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: false
        },

        profileImage: {
            type: String,
            default: ""
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        role: {
            type: String,
            default: "user"
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const User =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

module.exports = User;