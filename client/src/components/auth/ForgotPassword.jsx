import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await axios.post(
  "http://localhost:5000/api/auth/forgot-password",
  {
    email,
  }
);

      setMessage(response.data.message);

      // Save email for OTP page
      localStorage.setItem("resetEmail", email);

      // Go to OTP page
      navigate("/reset-otp");
    } catch (error) {
      console.log("Forgot password error:", error);

      if (error.response) {
        setError(error.response.data.message || "Failed to send OTP");
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-logo">ESSENZA</div>

        <h1>Forgot Password</h1>

        <p className="forgot-description">
          Enter your email address and we will send you an OTP to reset your
          password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="forgot-field">
            <label>EMAIL ADDRESS</label>

            <input
              type="email"
              placeholder="client@essenza.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {error && <p className="forgot-error">{error}</p>}

          {message && <p className="forgot-success">{message}</p>}

          <button type="submit" className="forgot-button" disabled={loading}>
            {loading ? "SENDING..." : "SEND OTP"}
          </button>
        </form>

        <div className="back-login">
          <button type="button" onClick={() => navigate("/login")}>
            ← BACK TO LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
