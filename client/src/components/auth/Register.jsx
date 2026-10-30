import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================
  // NORMAL REGISTER
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      setError("Name, email, password and confirm password are required");

      return;
    }

    try {
    const response = await api.post("/auth/register", {
  name,
  email,
  password,
  confirmPassword,
});

      const data = response.data;

      console.log(data);

      // Save email and create a pending verification session
localStorage.setItem("verificationEmail", data.email);
sessionStorage.setItem("verificationStarted", "true");

// Go to email verification page
navigate("/verify-email", { replace: true });
    } catch (error) {
      console.log("Registration error:", error);

      if (error.response) {
        console.log(error.response.data);

        setError(error.response.data.message || "Registration failed");
      } else {
        setError("Unable to connect to server");
      }
    }
  };

  // ==========================================
  // GOOGLE REGISTER / LOGIN
  // ==========================================

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
    const response = await api.post("/auth/google-login", {
  credential: credentialResponse.credential,
});

      const data = response.data;

      // Google authentication is already successful
      sessionStorage.setItem("token", data.token);

      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Go to Home
      navigate("/");
    } catch (error) {
      console.error("Google registration error:", error);

      if (error.response) {
        alert(error.response.data.message || "Google registration failed");
      } else {
        alert("Unable to connect to server");
      }
    }
  };

  return (
    <div className="maindiv">
      <div className="one">
        <h3>ESSENZA</h3>
      </div>

      <div className="two">
        <h2>Create your account</h2>
      </div>

      <div className="three">
        <h6>Enter your details to explore Essenza fragrants</h6>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="four">
          {/* NAME */}

          <label>Full name</label>

          <input
            type="text"
            placeholder="John wick"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          {/* EMAIL */}

          <label>Email</label>

          <input
            type="email"
            placeholder="johnwick@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {/* PASSWORD */}

          <label>Password</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="............"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
            />

            
<button
  type="button"
  className="eye-button"
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? (
    <EyeOff size={18} strokeWidth={1.8} />
  ) : (
    <Eye size={18} strokeWidth={1.8} />
  )}
</button>

          </div>

          {/* CONFIRM PASSWORD */}

          <label>Confirm password</label>

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="............"
              value={confirmPassword}
              onChange={(event) => setconfirmPassword(event.target.value)}
              minLength={8}
            />

            
<button
  type="button"
  className="eye-button"
  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  aria-label={
    showConfirmPassword
      ? "Hide confirm password"
      : "Show confirm password"
  }
>
  {showConfirmPassword ? (
    <EyeOff size={18} strokeWidth={1.8} />
  ) : (
    <Eye size={18} strokeWidth={1.8} />
  )}
</button>

          </div>
        </div>

        {/* ERROR */}

        {error && <p className="register-error">{error}</p>}

        {/* OR */}

        <div className="or-divider">
          <span></span>

          <p>OR</p>

          <span></span>
        </div>

        {/* GOOGLE */}

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            alert("Google registration failed");
          }}
          text="continue_with"
          size="large"
          width="400"
        />

        {/* REGISTER BUTTON */}

        <div className="five">
          <button type="submit">Register</button>
        </div>

        {/* LOGIN LINK */}

        <div className="six">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
