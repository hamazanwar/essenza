const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        otp: {
            type: String,
            required: true
        },

        purpose: {
            type: String,
            enum: [
                "email_verification",
                "password_reset"
            ],
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;