const {
    registerUserService,
    verifyEmailOtpService,
    resendEmailOtpService,
    loginUserService,
    googleLoginService,
    logoutUserService,
    forgotPasswordService,
    verifyResetOtpService,
    resetPasswordService
} = require("../services/authService");


// ==========================================
// REGISTER
// ==========================================

const registerUser = async (req, res) => {
    try {

        const result = await registerUserService(
            req.body
        );

        res.status(201).json(result);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Registration failed",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


// ==========================================
// VERIFY EMAIL OTP
// ==========================================

const verifyEmailOtp = async (req, res) => {
    try {

        const result =
            await verifyEmailOtpService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Email verification error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Email verification failed",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


// ==========================================
// RESEND EMAIL OTP
// ==========================================

const resendEmailOtp = async (req, res) => {
    try {

        const result =
            await resendEmailOtpService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Resend OTP error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Failed to resend verification OTP",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


// ==========================================
// LOGIN
// ==========================================

const loginUser = async (req, res) => {
    try {

        const result =
            await loginUserService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Login failed",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


// ==========================================
// GOOGLE LOGIN
// ==========================================

const googleLogin = async (req, res) => {
    try {

        const result =
            await googleLoginService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Google login error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Google login failed",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


// ==========================================
// LOGOUT
// ==========================================

const logoutUser = async (req, res) => {
    try {

        const result =
            await logoutUserService();

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        res.status(500).json({
            message: "Logout failed",
            error: error.message
        });
    }
};


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {
    try {

        const result =
            await forgotPasswordService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Failed to send password reset OTP",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


// ==========================================
// VERIFY RESET OTP
// ==========================================

const verifyResetOtp = async (req, res) => {
    try {

        const result =
            await verifyResetOtpService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Reset OTP verification error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "OTP verification failed",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {
    try {

        const result =
            await resetPasswordService(
                req.body
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Password reset failed",

            ...(error.statusCode
                ? {}
                : { error: error.message })
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    logoutUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    verifyEmailOtp,
    resendEmailOtp
};