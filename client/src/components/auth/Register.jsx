import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

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
      setError(
        "Name, email, password and confirm password are required"
      );

      return;
    }

    try {
      const response = await axios.post(
  "http://localhost:5000/api/auth/register",
  {
    name,
    email,
    password,
    confirmPassword,
  }
);

      const data = response.data;

      console.log(data);

      // Save email for OTP verification page
      localStorage.setItem(
        "verificationEmail",
        data.email
      );

      // Go to email verification page
      navigate("/verify-email");

    } catch (error) {
      console.log("Registration error:", error);

      if (error.response) {
        console.log(error.response.data);

        setError(
          error.response.data.message ||
          "Registration failed"
        );

      } else {
        setError(
          "Unable to connect to server"
        );
      }
    }
  };


  // ==========================================
  // GOOGLE REGISTER / LOGIN
  // ==========================================

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
    "http://localhost:5000/api/auth/google-login",
    {
        credential: credentialResponse.credential,
    }
);

const data = response.data;

      // Google authentication is already successful
      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Go to Home
      navigate("/");

    } catch (error) {
  console.error(
    "Google registration error:",
    error
  );

  if (error.response) {
    alert(
      error.response.data.message ||
      "Google registration failed"
    );
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
        <h6>
          Enter your details to explore Essenza fragrants
        </h6>
      </div>


      <form onSubmit={handleSubmit}>

        <div className="four">

          {/* NAME */}

          <label>Full name</label>

          <input
            type="text"
            placeholder="John wick"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
          />


          {/* EMAIL */}

          <label>Email</label>

          <input
            type="email"
            placeholder="johnwick@gmail.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />


          {/* PASSWORD */}

          <label>Password</label>

          <div className="password-wrapper">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="............"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={8}
            />


            <button
              type="button"
              className="eye-button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >

              {showPassword ? (

                // Eye with slash

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

                  <path d="M6.61 6.61C4.93 7.79 3.67 9.39 3 12c1.73 4.89 6 8 9 8 1.61 0 3.13-.42 4.47-1.15" />
                </svg>

              ) : (

                // Normal eye

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

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>

              )}

            </button>

          </div>


          {/* CONFIRM PASSWORD */}

          <label>Confirm password</label>

          <div className="password-wrapper">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="............"
              value={confirmPassword}
              onChange={(event) =>
                setconfirmPassword(
                  event.target.value
                )
              }
              minLength={8}
            />


            <button
              type="button"
              className="eye-button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >

              {showConfirmPassword ? (

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

                  <path d="M6.61 6.61C4.93 7.79 3.67 9.39 3 12c1.73 4.89 6 8 9 8 1.61 0 3.13-.42 4.47-1.15" />
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

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                  />
                </svg>

              )}

            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <p className="register-error">
            {error}
          </p>
        )}


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
            alert(
              "Google registration failed"
            );
          }}

          text="continue_with"
          size="large"
          width="400"
        />


        {/* REGISTER BUTTON */}

        <div className="five">

          <button type="submit">
            Register
          </button>

        </div>


        {/* LOGIN LINK */}

        <div className="six">

          Already have an account?{" "}

          <Link to="/login">
            Log in
          </Link>

        </div>

      </form>

    </div>
  );
}

export default Register;