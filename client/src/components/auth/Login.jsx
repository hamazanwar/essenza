import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";



function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await axios.post(
  "http://localhost:5000/api/auth/login",
  {
    email,
    password,
  }
);
      const data = response.data;

      console.log("Login response:", data);

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem("user", JSON.stringify(data.user));

      // Go to Home page
      navigate("/");
    } catch (error) {
      console.log("Login error:", error);

      if (error.response) {
        setError(error.response.data.message || "Login failed");
      } else {
        setError("Unable to connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">ESSENZA</div>

        {/* Heading */}
        <h1 className="login-title">Welcome Back</h1>

        {/* Description */}
        <p className="login-description">
          Enter your credentials to access your Essenza account.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-field">
            <label>EMAIL ADDRESS</label>

            <input
              type="email"
              placeholder="client@essenza.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <div className="password-label-row">
              <label>PASSWORD</label>

              <Link to="/forgot-password" className="forgot-link">
                FORGOT PASSWORD?
              </Link>
            </div>

            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                className="login-eye-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                    <path d="M9.88 4.24A10.7 10.7 0 0 1 12 4c5 0 9.27 3.11 11 8-0.67 1.87-1.68 3.48-2.88 4.72" />
                    <path d="M6.61 6.61C4.93 7.79 3.67 6.61 6.61 6.61" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <p className="login-error">{error}</p>}

          {/* Login button */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOG IN →"}
          </button>
        </form>

        {/* OR */}
        <div className="login-divider">
          <span></span>

          <p>OR</p>

          <span></span>
        </div>

        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const response = await axios.post(
    "http://localhost:5000/api/auth/google-login",
    {
        credential: credentialResponse.credential,
    }
);

const data = response.data;

              localStorage.setItem("token", data.token);

              localStorage.setItem("user", JSON.stringify(data.user));

              navigate("/");
            } catch (error) {
              console.error("Google login error:", error);

              setError("Unable to connect to server");
            }
          }}
          onError={() => {
            setError("Google login failed");
          }}
          text="continue_with"
          size="large"
          width="400"
        />

        {/* Register link */}
        <div className="login-register">
          <span>Don't have an account?</span>

          <Link to="/register">SIGN UP</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
