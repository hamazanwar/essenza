import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";

function AdminProfileEdit() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          navigate("/admin/login", { replace: true });
          return;
        }

        const response = await api.get("/admin/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        const admin = response.data.admin;

        setName(admin.name || "");
        setEmail(admin.email || "");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load admin profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("adminToken");

      const response = await api.patch(
  "/admin/profile",
  { name: name.trim() },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

      const updatedAdmin = response.data.admin;

      const storedAdmin = JSON.parse(
        localStorage.getItem("admin") || "{}"
      );

      localStorage.setItem(
        "admin",
        JSON.stringify({
          ...storedAdmin,
          ...updatedAdmin,
          name: updatedAdmin?.name || name.trim(),
        })
      );

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        navigate("/admin/profile");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading admin profile...</p>;
  }

  return (
    <div className="admin-profile-page">
      <AdminNavbar />

      <main className="admin-profile-content">
        <h1>EDIT ADMIN PROFILE</h1>

        <div className="admin-profile-card">
          <form onSubmit={handleSubmit}>
            <div className="admin-profile-item">
              <label htmlFor="admin-name">Name</label>
              <input
                id="admin-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="admin-profile-item">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                readOnly
              />
              <small>Email address cannot be changed here.</small>
            </div>

            {error && (
              <p className="admin-profile-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="admin-profile-success" role="status">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="admin-edit-profile-button"
              disabled={saving}
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>

            <button
              type="button"
              className="admin-profile-photo-button"
              onClick={() => navigate("/admin/profile")}
              disabled={saving}
            >
              CANCEL
            </button>
          </form>
        </div>
      </main>

      <AdminFooter />
    </div>
  );
}

export default AdminProfileEdit;