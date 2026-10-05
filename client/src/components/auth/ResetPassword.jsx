import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
setSuccess("");

    const email = localStorage.getItem("resetEmail");
    const otp = localStorage.getItem("resetOtp");

    if (!email || !otp) {
      setError("Reset session expired. Please try again.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
  "http://localhost:5000/api/auth/reset-password",
  {
    email,
    otp,
    newPassword,
  }
);

      console.log("Reset password response:", response.data);

      // Remove reset information
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");

      setSuccess("Password reset successfully");

setTimeout(() => {
  navigate("/login");
}, 2000);
    } catch (error) {
      console.log("Reset password error:", error);

      if (error.response) {
        setError(error.response.data.message || "Password reset failed");
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <div className="reset-logo">ESSENZA</div>

        <h1 className="reset-title">Reset Password</h1>

        <p className="reset-description">
          Create a new password for your Essenza account.
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}

          <div className="reset-field">
            <label>NEW PASSWORD</label>

            <div className="reset-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
              />

              <button
                type="button"
                className="reset-eye-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}

          <div className="reset-field">
            <label>CONFIRM PASSWORD</label>

            <div className="reset-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
              />

              <button
                type="button"
                className="reset-eye-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}

{error && <p className="reset-error">{error}</p>}

{/* Success */}

{success && (
  <p className="reset-success">{success}</p>
)}

          {/* Reset button */}

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? "RESETTING..." : "RESET PASSWORD"}
          </button>
        </form>

        <div className="reset-footer">© 2026 ESSENZA FRAGRANT</div>
      </div>
    </div>
  );
}

export default ResetPassword;
