import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ResetOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const email = localStorage.getItem("resetEmail");

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

  // ========================================
  // Verify OTP
  // ========================================

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Reset email not found. Please start again.");

      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
  "http://localhost:5000/api/auth/verify-reset-otp",
  {
    email,
    otp,
  }
);

      setMessage(response.data.message);

      // Save OTP for reset password page
      localStorage.setItem("resetOtp", otp);

      // Go to reset password page
      setTimeout(() => {
        navigate("/reset-password");
      }, 1000);
    } catch (error) {
      console.log("Reset OTP verification error:", error);

      if (error.response) {
        setError(error.response.data.message || "Invalid OTP");
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Resend OTP
  // ========================================

  const handleResend = async () => {
    setMessage("");
    setError("");

    if (resendTimer > 0 || resending) {
    return;
  }

    if (!email) {
      setError("Reset email not found");

      return;
    }

    try {
      setResending(true);

      const response = await axios.post(
  "http://localhost:5000/api/auth/forgot-password",
  {
    email,
  }
);

      setMessage(response.data.message);

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
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-logo">ESSENZA</div>

        <h1>Enter OTP</h1>

        <p className="forgot-description">We have sent a 6-digit OTP to</p>

        <p className="reset-email">{email}</p>

        <form onSubmit={handleVerifyOtp}>
          <div className="forgot-field">
            <label>ENTER OTP</label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");

                setOtp(value);
              }}
              required
            />
          </div>

          <p className="otp-valid-text">OTP is valid for 5 minutes</p>

          {error && <p className="forgot-error">{error}</p>}

          {message && <p className="forgot-success">{message}</p>}

          <button type="submit" className="forgot-button" disabled={loading}>
            {loading ? "VERIFYING..." : "VERIFY OTP"}
          </button>
        </form>

        <div className="resend-reset">
          <span>Didn't receive the code?</span>

          <button
  type="button"
  onClick={handleResend}
  disabled={resending || resendTimer > 0}
>
  {resending
    ? "SENDING..."
    : resendTimer > 0
      ? `RESEND OTP IN ${resendTimer}s`
      : "RESEND OTP"
  }
</button>
        </div>

        <div className="back-login">
          <button type="button" onClick={() => navigate("/login")}>
            ← BACK TO LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetOtp;
