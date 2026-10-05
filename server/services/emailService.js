const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async (email, otp, purpose) => {
  let subject;
  let heading;
  let message;

  if (purpose === "email_verification") {
    subject = "ESSENZA Email Verification";

    heading = "Verify Your Email";

    message = "Use the OTP below to verify your ESSENZA account.";
  } else if (purpose === "password_reset") {
    subject = "ESSENZA Password Reset";

    heading = "Reset Your Password";

    message = "Use the OTP below to reset your ESSENZA password.";
  } else {
    throw new Error("Invalid OTP purpose");
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,

    to: email,

    subject: subject,

    html: `
            <div style="
                font-family: Arial, sans-serif;
                padding: 20px;
            ">

                <h2>ESSENZA</h2>

                <h3>${heading}</h3>

                <p>${message}</p>

                <h1 style="
                    letter-spacing: 8px;
                    font-size: 32px;
                    color: #000;
                ">
                    ${otp}
                </h1>

                <p>
                    This OTP is valid for
                    <strong>5 minutes</strong>.
                </p>

                <p>
                    If you did not request this OTP,
                    please ignore this email.
                </p>

            </div>
        `,
  });

  console.log("Email sent:", info.messageId);
};

module.exports = {
  sendOtpEmail,
};
