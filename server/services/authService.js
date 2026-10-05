const User = require("../models/user");
const Otp = require("../models/Otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");

const { sendOtpEmail } = require("./emailService");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


// ==========================================
// REGISTER USER
// ==========================================

const registerUserService = async ({
    name,
    email,
    password,
    confirmPassword
}) => {

    // 1. Check required fields
    if (!name || !email || !password || !confirmPassword) {
        const error = new Error(
            "Name, email, password and confirm password are required"
        );

        error.statusCode = 400;

        throw error;
    }


    // 2. Check passwords
if (password !== confirmPassword) {
    const error = new Error(
        "Passwords do not match"
    );

    error.statusCode = 400;

    throw error;
}


// 3. Check password length
if (password.length < 8) {
    const error = new Error(
        "Password must be at least 8 characters"
    );

    error.statusCode = 400;

    throw error;
}


// 4. Check existing user
    const existingUser = await User.findOne({
        email
    });

    if (existingUser) {
        const error = new Error(
            "Email already registered"
        );

        error.statusCode = 409;

        throw error;
    }


    // 4. Hash password
    const hashedPassword = await bcrypt.hash(
        password,
        10
    );


    let createdUser = null;

    try {

        // 5. Create user
        createdUser = await User.create({
            name,
            email,
            password: hashedPassword
        });


        // 6. Generate OTP
        const emailVerificationOtp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();


        // OTP expires after 5 minutes
        const emailVerificationOtpExpires =
            new Date(Date.now() + 5 * 60 * 1000);


        // 7. Save OTP
        await Otp.create({
            userId: createdUser._id,
            email: createdUser.email,
            otp: emailVerificationOtp,
            purpose: "email_verification",
            expiresAt: emailVerificationOtpExpires
        });


        // 8. Send email
        await sendOtpEmail(
            email,
            emailVerificationOtp,
            "email_verification"
        );


        // 9. Return result
        return {
            message: "Registration successful. OTP sent to your email",
            email: createdUser.email
        };

    } catch (error) {

        // If OTP/email fails,
        // remove the created user
        if (createdUser) {

            await Otp.deleteMany({
                userId: createdUser._id
            });

            await User.deleteOne({
                _id: createdUser._id
            });
        }

        throw error;
    }
};


// ==========================================
// VERIFY EMAIL OTP
// ==========================================

const verifyEmailOtpService = async ({
    email,
    otp
}) => {

    // 1. Check required fields
    if (!email || !otp) {
        const error = new Error(
            "Email and OTP are required"
        );

        error.statusCode = 400;

        throw error;
    }


    // 2. Find user
    const user = await User.findOne({
        email
    });

    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // 3. Find latest OTP
    const otpRecord = await Otp.findOne({
        email,
        purpose: "email_verification"
    }).sort({
        createdAt: -1
    });


    if (!otpRecord) {
        const error = new Error(
            "No verification OTP found"
        );

        error.statusCode = 400;

        throw error;
    }


    // 4. Check expiry
    if (otpRecord.expiresAt < new Date()) {
        const error = new Error(
            "Verification OTP has expired"
        );

        error.statusCode = 400;

        throw error;
    }


    // 5. Check OTP
    if (otpRecord.otp !== otp) {
        const error = new Error(
            "Invalid verification OTP"
        );

        error.statusCode = 400;

        throw error;
    }


    // 6. Verify email
    user.isEmailVerified = true;

    await user.save();


    // 7. Delete used OTP
    await Otp.deleteOne({
        _id: otpRecord._id
    });


    return {
        message: "Email verified successfully"
    };
};


// ==========================================
// RESEND EMAIL OTP
// ==========================================

const resendEmailOtpService = async ({
    email
}) => {

    // 1. Check email
    if (!email) {
        const error = new Error(
            "Email is required"
        );

        error.statusCode = 400;

        throw error;
    }


    // 2. Find user
    const user = await User.findOne({
        email
    });

    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // 3. Check verification
if (user.isEmailVerified) {
    const error = new Error(
        "Email is already verified"
    );

    error.statusCode = 400;

    throw error;
}


// 4. Check resend cooldown
const latestOtp = await Otp.findOne({
    email,
    purpose: "email_verification"
}).sort({
    createdAt: -1
});

if (latestOtp) {
    const secondsSinceOtp =
        Math.floor(
            (Date.now() - latestOtp.createdAt.getTime()) / 1000
        );

    if (secondsSinceOtp < 60) {
        const remainingSeconds =
            60 - secondsSinceOtp;

        const error = new Error(
            `Please wait ${remainingSeconds} seconds before requesting another OTP`
        );

        error.statusCode = 429;

        throw error;
    }
}


// 5. Delete old OTP
await Otp.deleteMany({
    email,
    purpose: "email_verification"
});

    // 5. Generate new OTP
    const emailVerificationOtp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();


    // 6. Expiry
    const emailVerificationOtpExpires =
        new Date(Date.now() + 5 * 60 * 1000);


    // 7. Save OTP
    await Otp.create({
        userId: user._id,
        email: user.email,
        otp: emailVerificationOtp,
        purpose: "email_verification",
        expiresAt: emailVerificationOtpExpires
    });


    // 8. Send email
    await sendOtpEmail(
        email,
        emailVerificationOtp,
        "email_verification"
    );


    return {
        message: "Verification OTP resent successfully"
    };
};


// ==========================================
// LOGIN USER
// ==========================================

const loginUserService = async ({
    email,
    password
}) => {

    // 1. Required fields
    if (!email || !password) {
        const error = new Error(
            "Email and password are required"
        );

        error.statusCode = 400;

        throw error;
    }


    // 2. Find user
    const user = await User.findOne({
        email
    });

    if (!user) {
        const error = new Error(
            "Invalid email or password"
        );

        error.statusCode = 401;

        throw error;
    }


    // 3. Check active status
    if (!user.isActive) {
        const error = new Error(
            "Your account is inactive"
        );

        error.statusCode = 403;

        throw error;
    }


    // 4. Check email verification
    if (!user.isEmailVerified) {
        const error = new Error(
            "Please verify your email before logging in"
        );

        error.statusCode = 403;

        throw error;
    }


    // 5. Compare password
    const isPasswordCorrect =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!isPasswordCorrect) {
        const error = new Error(
            "Invalid email or password"
        );

        error.statusCode = 401;

        throw error;
    }


    // 6. Create JWT
    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );


    // 7. Return login result
    return {
        message: "Login successful",

        token,

        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};


// ==========================================
// GOOGLE LOGIN
// ==========================================

const googleLoginService = async ({
    credential
}) => {

    // 1. Check credential
    if (!credential) {
        const error = new Error(
            "Google credential is required"
        );

        error.statusCode = 400;

        throw error;
    }


    // 2. Verify Google token
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });


    const payload = ticket.getPayload();


    const {
        sub,
        email,
        name,
        email_verified
    } = payload;


    // 3. Check Google email
    if (!email || !email_verified) {
        const error = new Error(
            "Google email could not be verified"
        );

        error.statusCode = 400;

        throw error;
    }


    // 4. Find using Google ID
    let user = await User.findOne({
        googleId: sub
    });


    // 5. If not found, find using email
    if (!user) {

        user = await User.findOne({
            email: email.toLowerCase()
        });
    }


    // 6. Create new user
    if (!user) {

        user = await User.create({
            name: name || "Google User",
            email: email.toLowerCase(),
            googleId: sub,
            password: null,
            profileImage:"",
            role: "user",
            isEmailVerified: true,
            isActive: true
        });

    } else {

        // 7. Existing user

        if (!user.isActive) {
            const error = new Error(
                "Your account is inactive"
            );

            error.statusCode = 403;

            throw error;
        }


        // Connect Google account
        if (!user.googleId) {
  user.googleId = sub;
}

user.isEmailVerified = true;

// Remove an old Google profile image, but keep a manually uploaded image
if (user.profileImage && user.profileImage.startsWith("http")) {
  user.profileImage = "";
}

await user.save();
    }


    // 8. Create ESSENZA JWT
    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );


    // 9. Return result
    return {
        message: "Google login successful",

        token,

        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        }
    };
};


// ==========================================
// LOGOUT
// ==========================================

const logoutUserService = async () => {

    return {
        message: "Logout successful"
    };
};


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPasswordService = async ({
    email
}) => {

    // 1. Check email
    if (!email) {
        const error = new Error(
            "Email is required"
        );

        error.statusCode = 400;

        throw error;
    }


    // 2. Find user
    const user = await User.findOne({
        email
    });


    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // 3. Check resend cooldown
const latestOtp = await Otp.findOne({
    email,
    purpose: "password_reset"
}).sort({
    createdAt: -1
});

if (latestOtp) {
    const secondsSinceOtp =
        Math.floor(
            (Date.now() - latestOtp.createdAt.getTime()) / 1000
        );

    if (secondsSinceOtp < 60) {
        const remainingSeconds =
            60 - secondsSinceOtp;

        const error = new Error(
            `Please wait ${remainingSeconds} seconds before requesting another OTP`
        );

        error.statusCode = 429;

        throw error;
    }
}


// 4. Delete old password reset OTP
await Otp.deleteMany({
    email,
    purpose: "password_reset"
});

    // 4. Generate OTP
    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();


    // 5. Expiry
    const otpExpires =
        new Date(Date.now() + 5 * 60 * 1000);


    // 6. Save OTP
    await Otp.create({
        userId: user._id,
        email: user.email,
        otp,
        purpose: "password_reset",
        expiresAt: otpExpires
    });


    // 7. Send email
    await sendOtpEmail(
        email,
        otp,
        "password_reset"
    );


    return {
        message: "Password reset OTP sent to your email"
    };
};


// ==========================================
// VERIFY RESET OTP
// ==========================================

const verifyResetOtpService = async ({
    email,
    otp
}) => {

    // 1. Check fields
    if (!email || !otp) {
        const error = new Error(
            "Email and OTP are required"
        );

        error.statusCode = 400;

        throw error;
    }


    // 2. Find user
    const user = await User.findOne({
        email
    });


    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // 3. Find OTP
    const otpRecord = await Otp.findOne({
        email,
        purpose: "password_reset"
    }).sort({
        createdAt: -1
    });


    if (!otpRecord) {
        const error = new Error(
            "No password reset OTP found"
        );

        error.statusCode = 400;

        throw error;
    }


    // 4. Check expiry
    if (otpRecord.expiresAt < new Date()) {
        const error = new Error(
            "OTP has expired"
        );

        error.statusCode = 400;

        throw error;
    }


    // 5. Check OTP
    if (otpRecord.otp !== otp) {
        const error = new Error(
            "Invalid OTP"
        );

        error.statusCode = 400;

        throw error;
    }


    return {
        message: "OTP verified successfully"
    };
};


// ==========================================
// RESET PASSWORD
// ==========================================

const resetPasswordService = async ({
    email,
    otp,
    newPassword
}) => {

    // 1. Check fields
if (!email || !otp || !newPassword) {
    const error = new Error(
        "Email, OTP and new password are required"
    );

    error.statusCode = 400;

    throw error;
}


// 2. Check password length
if (newPassword.length < 8) {
    const error = new Error(
        "Password must be at least 8 characters"
    );

    error.statusCode = 400;

    throw error;
}


// 3. Find user
const user = await User.findOne({
    email
});


    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // 3. Find OTP
    const otpRecord = await Otp.findOne({
        email,
        purpose: "password_reset"
    }).sort({
        createdAt: -1
    });


    if (!otpRecord) {
        const error = new Error(
            "No password reset OTP found"
        );

        error.statusCode = 400;

        throw error;
    }


    // 4. Check expiry
    if (otpRecord.expiresAt < new Date()) {
        const error = new Error(
            "OTP has expired"
        );

        error.statusCode = 400;

        throw error;
    }


    // 5. Check OTP
    if (otpRecord.otp !== otp) {
        const error = new Error(
            "Invalid OTP"
        );

        error.statusCode = 400;

        throw error;
    }


    // 6. Hash new password
    const hashedPassword =
        await bcrypt.hash(newPassword, 10);


    // 7. Update password
    user.password = hashedPassword;

    await user.save();


    // 8. Delete OTP
    await Otp.deleteOne({
        _id: otpRecord._id
    });


    return {
        message: "Password reset successfully"
    };
};


module.exports = {
    registerUserService,
    verifyEmailOtpService,
    resendEmailOtpService,
    loginUserService,
    googleLoginService,
    logoutUserService,
    forgotPasswordService,
    verifyResetOtpService,
    resetPasswordService
};