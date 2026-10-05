import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
    "http://localhost:5000/api/admin/auth/login",
    {
        email,
        password,
    }
);

const data = response.data;

      console.log("Admin login successful:", data);

      localStorage.setItem("adminToken", data.token);

      localStorage.setItem("admin", JSON.stringify(data.admin));

      navigate("/admin/dashboard");

      // Dashboard navigation will be added next
    } catch (error) {
      console.error("Admin login error:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <h1 className="admin-logo">ESSENZA</h1>

        <h2 className="admin-title">Admin Login</h2>

        <p className="admin-subtitle">Sign in to manage your store</p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          {/* EMAIL */}

          <div className="admin-input-group">
            <label htmlFor="admin-email">Email</label>

            <input
              id="admin-email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {/* PASSWORD */}

          <div className="admin-input-group">
            <label htmlFor="admin-password">Password</label>

            <input
              id="admin-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {/* ERROR */}

          {error && <p className="admin-error">{error}</p>}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOG IN →"}
          </button>
        </form>

        <p className="admin-footer-text">ESSENZA ADMIN PANEL</p>
      </div>
    </div>
  );
}

export default AdminLogin;
