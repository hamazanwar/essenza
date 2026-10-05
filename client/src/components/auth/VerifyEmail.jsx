import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Get email saved during registration
  const email = localStorage.getItem("verificationEmail");

  // ========================================
// Resend OTP Timer
// ========================================

useEffect(() => {
  if (resendTimer <= 0) {
    return;
  }

  const timer = setInterval(() => {
    setResendTimer((previousTimer) => previousTimer - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [resendTimer]);

  //========================================
  // Verify OTP
  //========================================
  const handleVerify = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // Check whether email exists
    if (!email) {
      setError("Verification email not found");
      return;
    }

    // Check OTP length
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
  "http://localhost:5000/api/auth/verify-email-otp",
  {
    email,
    otp,
  }
);

      const data = response.data;

      setMessage(data.message);

      // Remove email after successful verification
      localStorage.removeItem("verificationEmail");

      // Go to login
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.log("OTP verification error:", error);

      if (error.response) {
        setError(error.response.data.message || "OTP verification failed");
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  //========================================
  // Resend OTP
  //========================================
  const handleResend = async () => {
    setMessage("");
    setError("");

    if (resendTimer > 0 || resending) {
  return;
}

    if (!email) {
      setError("Verification email not found");
      return;
    }

    try {
      setResending(true);

      const response = await axios.post(
  "http://localhost:5000/api/auth/resend-email-otp",
  {
    email,
  }
);
      const data = response.data;

     setMessage(data.message);

// Clear OTP field
setOtp("");

// Restart resend timer
setResendTimer(60);
    } catch (error) {
      console.log("Resend OTP error:", error);

      if (error.response) {
        setError(error.response.data.message || "Unable to resend OTP");
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        {/* Logo */}
        <div className="verify-logo">ESSENZA</div>

        {/* Heading */}
        <h1>Verify your email</h1>

        {/* Description */}
        <p className="verify-description">
          We have sent a 6-digit verification code to
        </p>

        {/* Email */}
        <p className="verify-email">{email}</p>

        {/* OTP Form */}
        <form onSubmit={handleVerify}>
          <label className="otp-label">ENTER OTP</label>

          <input
            className="otp-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "");

              setOtp(value);
            }}
          />

          <p className="otp-info">OTP is valid for 5 minutes</p>

          {/* Error */}
          {error && <p className="otp-error">{error}</p>}

          {/* Success */}
          {message && <p className="otp-success">{message}</p>}

          {/* Verify button */}
          <button type="submit" className="verify-button" disabled={loading}>
            {loading ? "VERIFYING..." : "VERIFY EMAIL"}
          </button>
        </form>

        {/* Resend */}
        <div className="resend-section">
          <span>Didn't receive the code?</span>

          <button 
  type="button" 
  className="resend-button" 
  onClick={handleResend} 
  disabled={resending || resendTimer > 0} 
> 
  {resending
    ? "SENDING..."
    : resendTimer > 0
      ? `Resend OTP in ${resendTimer}s`
      : "Resend OTP"
  } 
</button>
        </div>

        {/* Footer */}
        <div className="verify-footer">© 2026 ESSENZA FRAGRANT</div>
      </div>
    </div>
  );
}

export default VerifyEmail;
