import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";
import axios from "axios";

function AdminProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const response = await axios.get(
          "http://localhost:5000/api/admin/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = response.data;

        setAdmin(data.admin);
      } catch (error) {
        console.error("Admin profile error:", error);

        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");

      const formData = new FormData();

      formData.append("profileImage", file);

      const response = await axios.patch(
        "http://localhost:5000/api/admin/profile/image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;

      setAdmin((previousAdmin) => ({
        ...previousAdmin,
        profileImage: data.profileImage,
      }));

      setSuccess("Profile photo updated successfully.");
    } catch (error) {
      console.error("Admin profile image error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  if (loading) {
    return <p>Loading admin profile...</p>;
  }

  if (error && !admin) {
    return <p>{error}</p>;
  }

  return (
    <div className="admin-profile-page">
      <AdminNavbar />

      <main className="admin-profile-content">
        <h1>ADMIN PROFILE</h1>

        {admin && (
          <>
            <div className="admin-profile-photo-section">
              <div className="admin-profile-photo">
                {admin.profileImage ? (
                  <img
                    src={
                      admin.profileImage.startsWith("http")
                        ? admin.profileImage
                        : `http://localhost:5000${admin.profileImage}`
                    }
                    alt="Admin Profile"
                  />
                ) : (
                  <div className="admin-profile-photo-placeholder">👤</div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfileImageChange}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
              />

              <button
                className="admin-profile-photo-button"
                onClick={handleProfileImageClick}
                disabled={uploading}
              >
                {uploading
                  ? "UPLOADING..."
                  : admin.profileImage
                    ? "CHANGE PHOTO"
                    : "ADD PHOTO"}
              </button>

              <p className="admin-profile-photo-hint">
                JPG, PNG or WEBP · Maximum 5MB
              </p>

              {success && <p className="admin-profile-success">{success}</p>}

              {error && <p className="admin-profile-error">{error}</p>}
            </div>

            <div className="admin-profile-card">
              <div className="admin-profile-item">
                <span>Name</span>
                <p>{admin.name}</p>
              </div>

              <div className="admin-profile-item">
                <span>Email</span>
                <p>{admin.email}</p>
              </div>

              <div className="admin-profile-item">
                <span>Role</span>
                <p>{admin.role}</p>
              </div>

              <div className="admin-profile-item">
                <span>Status</span>
                <p>{admin.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </>
        )}

        <button
          className="admin-edit-profile-button"
          onClick={() => navigate("/admin/profile/edit")}
        >
          EDIT PROFILE
        </button>
      </main>

      <AdminFooter />
    </div>
  );
}

export default AdminProfile;
