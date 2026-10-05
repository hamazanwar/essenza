const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    verifyEmailOtp,
    resendEmailOtp
} = require("../controllers/authController");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/google-login", googleLogin);

router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyResetOtp);

router.post("/reset-password", resetPassword);

router.post("/verify-email-otp", verifyEmailOtp);

router.post("/resend-email-otp", resendEmailOtp);


module.exports = router;