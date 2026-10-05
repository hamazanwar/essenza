import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editName, setEditName] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [addressLoading, setAddressLoading] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ==========================================
  // FETCH PROFILE AND ADDRESSES
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // CHECK LOGIN
        if (!token) {
          navigate("/register");
          return;
        }

        // ==========================================
        // GET PROFILE
        // ==========================================

        const profileResponse = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const profileData = profileResponse.data;

        setUser(profileData.user);

        // ==========================================
        // GET ADDRESSES
        // ==========================================

        const addressResponse = await axios.get(
          "http://localhost:5000/api/users/addresses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const addressData = addressResponse.data;

        setAddresses(addressData.addresses || []);
      } catch (error) {
        console.error("Profile fetch error:", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/register");
          return;
        }

        setError(
          error.response?.data?.message || "Unable to connect to server",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ==========================================
  // OPEN PROFILE EDIT
  // ==========================================

  const handleEditProfile = () => {
    if (!user) {
      return;
    }

    setEditName(user.name || "");
    setShowProfileEdit(true);
    setError("");
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        "http://localhost:5000/api/users/profile",
        {
          name: editName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;

      // Update profile on screen
      setUser(data.user);

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Close edit form
      setShowProfileEdit(false);
    } catch (error) {
      console.error("Update profile error:", error);

      setError(error.response?.data?.message || "Unable to update profile");
    }
  };

  // ==========================================
  // OPEN ADD ADDRESS FORM
  // ==========================================

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);

    setFullName("");
    setAddress("");
    setCity("");
    setState("");
    setPincode("");

    setShowAddressForm(true);
    setError("");
  };

  // ==========================================
  // OPEN EDIT ADDRESS FORM
  // ==========================================

  const handleEditAddress = (addressItem) => {
    setEditingAddressId(addressItem._id);

    setFullName(addressItem.fullName || "");
    setAddress(addressItem.address || "");
    setCity(addressItem.city || "");
    setState(addressItem.state || "");
    setPincode(addressItem.pincode || "");

    setShowAddressForm(true);

    setDeleteAddressId(null);
    setError("");
  };

  // ==========================================
  // SAVE / UPDATE ADDRESS
  // ==========================================

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    setAddressLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const addressData = {
        fullName,
        address,
        city,
        state,
        pincode,
      };

      let response;

      // ==========================================
      // EDIT ADDRESS
      // ==========================================

      if (editingAddressId) {
        response = await axios.patch(
          `http://localhost:5000/api/users/address/${editingAddressId}`,
          addressData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      // ==========================================
      // ADD ADDRESS
      // ==========================================
      else {
        response = await axios.post(
          "http://localhost:5000/api/users/address",
          addressData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      const data = response.data;

      // ==========================================
      // ADD NEW ADDRESS
      // ==========================================

      if (!editingAddressId) {
        setAddresses((previousAddresses) => [
          ...previousAddresses,
          data.address,
        ]);
      }

      // ==========================================
      // UPDATE EXISTING ADDRESS
      // ==========================================
      else {
        setAddresses((previousAddresses) =>
          previousAddresses.map((addressItem) =>
            addressItem._id === editingAddressId ? data.address : addressItem,
          ),
        );
      }

      // ==========================================
      // CLEAR FORM
      // ==========================================

      setFullName("");
      setAddress("");
      setCity("");
      setState("");
      setPincode("");

      setEditingAddressId(null);
      setShowAddressForm(false);
    } catch (error) {
      console.error("Save address error:", error);

      setError(error.response?.data?.message || "Unable to save address");
    } finally {
      setAddressLoading(false);
    }
  };

  // ==========================================
  // CANCEL ADDRESS FORM
  // ==========================================

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);

    setFullName("");
    setAddress("");
    setCity("");
    setState("");
    setPincode("");

    setError("");
  };

  // ==========================================
  // DELETE ADDRESS
  // ==========================================

  const handleDeleteAddress = async (addressId) => {
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/users/address/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Remove address from screen
      setAddresses((previousAddresses) =>
        previousAddresses.filter(
          (addressItem) => addressItem._id !== addressId,
        ),
      );

      setDeleteAddressId(null);
    } catch (error) {
      console.error("Delete address error:", error);

      setError(error.response?.data?.message || "Unable to delete address");
    }
  };

  // ==========================================
  // SET DEFAULT ADDRESS
  // ==========================================

  const handleSetDefaultAddress = async (addressId) => {
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/users/address/${addressId}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update all addresses
      setAddresses((previousAddresses) =>
        previousAddresses.map((addressItem) => ({
          ...addressItem,
          isDefault: addressItem._id === addressId,
        })),
      );
    } catch (error) {
      console.error("Set default address error:", error);

      setError(
        error.response?.data?.message || "Unable to set default address",
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  //upload photo
  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setProfileImageLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch(
        "http://localhost:5000/api/users/profile/image",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile image");
      }

      const updatedUser = {
        ...user,
        profileImage: data.profileImage,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile image upload error:", error);
      setError(error.message || "Failed to upload profile image");
    } finally {
      setProfileImageLoading(false);
      event.target.value = "";
    }
  };

  //remove photo
  const handleRemoveProfileImage = async () => {
    try {
      setProfileImageLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/users/profile/image",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove profile image");
      }

      const updatedUser = {
        ...user,
        profileImage: "",
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Remove profile image error:", error);
      setError(error.message || "Failed to remove profile image");
    } finally {
      setProfileImageLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div>
        <Navbar />

        <main className="profile-page">
          <p className="profile-loading">Loading profile...</p>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================
  // PROFILE PAGE
  // ==========================================

  return (
    <div>
      <Navbar />

      <main className="profile-page">
        <div className="profile-container">
          {/* ==================================
              TITLE
          ================================== */}

          <div className="profile-heading">
            <p>MY ACCOUNT</p>
            <h1>PROFILE</h1>
          </div>

          {/* ==================================
              ERROR
          ================================== */}

          {error && <p className="profile-error">{error}</p>}

          {/* ==================================
              USER PROFILE
          ================================== */}

          {user && (
            <section className="profile-card">
              {/* PROFILE PHOTO */}

              <div className="profile-photo-section">
                {user.profileImage ? (
                  <img
                    src={
                      user.profileImage.startsWith("http")
                        ? user.profileImage
                        : `http://localhost:5000${user.profileImage}`
                    }
                    alt=""
                    className="profile-photo"
                  />
                ) : (
                  <div className="profile-photo-placeholder">👤</div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleProfileImageChange}
                  style={{ display: "none" }}
                />

                <div className="profile-photo-actions">
                  <button
                    type="button"
                    className="profile-photo-button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={profileImageLoading}
                  >
                    {profileImageLoading
                      ? "Uploading..."
                      : user.profileImage
                        ? "Change Photo"
                        : "Add Photo"}
                  </button>

                  {user.profileImage && !profileImageLoading && (
                    <button
                      type="button"
                      className="profile-photo-remove"
                      onClick={handleRemoveProfileImage}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* USER INFORMATION */}

              <div className="profile-information">
                <div className="profile-info-item">
                  <span>NAME</span>
                  <strong>{user.name}</strong>
                </div>

                <div className="profile-info-item">
                  <span>EMAIL</span>
                  <strong>{user.email}</strong>
                </div>

                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleEditProfile}
                >
                  EDIT PROFILE
                </button>
              </div>
            </section>
          )}

          {/* ==================================
              EDIT PROFILE FORM
          ================================== */}

          {showProfileEdit && (
            <section className="profile-edit-section">
              <h2>EDIT PROFILE</h2>

              <form onSubmit={handleUpdateProfile}>
                <label>NAME</label>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  required
                />

                <div className="profile-edit-actions">
                  <button type="submit">SAVE CHANGES</button>

                  <button
                    type="button"
                    onClick={() => setShowProfileEdit(false)}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ==================================
              ADDRESS SECTION
          ================================== */}

          <section className="address-section">
            {/* ADDRESS HEADING */}

            <div className="address-heading">
              <div>
                <p>DELIVERY</p>
                <h2>MY ADDRESSES</h2>
              </div>

              <button
                type="button"
                className="add-address-button"
                onClick={handleOpenAddAddress}
              >
                + ADD ADDRESS
              </button>
            </div>

            {/* ==================================
                ADDRESS FORM
            ================================== */}

            {showAddressForm && (
              <form className="address-form" onSubmit={handleSaveAddress}>
                <h3>{editingAddressId ? "EDIT ADDRESS" : "ADD ADDRESS"}</h3>

                {/* FULL NAME */}

                <label>FULL NAME</label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  required
                />

                {/* ADDRESS */}

                <label>ADDRESS</label>

                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="House / Street / Area"
                  required
                />

                {/* CITY */}

                <label>CITY</label>

                <input
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City"
                  required
                />

                {/* STATE */}

                <label>STATE</label>

                <input
                  type="text"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  placeholder="State"
                  required
                />

                {/* PINCODE */}

                <label>PINCODE</label>

                <input
                  type="text"
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value)}
                  placeholder="Pincode"
                  required
                />

                {/* FORM BUTTONS */}

                <div className="address-form-actions">
                  <button type="submit" disabled={addressLoading}>
                    {addressLoading
                      ? "SAVING..."
                      : editingAddressId
                        ? "UPDATE ADDRESS"
                        : "SAVE ADDRESS"}
                  </button>

                  <button type="button" onClick={handleCancelAddress}>
                    CANCEL
                  </button>
                </div>
              </form>
            )}

            {/* ==================================
                ADDRESS LIST
            ================================== */}

            {addresses.length === 0 ? (
              <div className="empty-address">
                <p>No addresses added yet.</p>

                <button type="button" onClick={handleOpenAddAddress}>
                  + ADD ADDRESS
                </button>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((addressItem) => (
                  <div
                    className={
                      addressItem.isDefault
                        ? "address-card default-address"
                        : "address-card"
                    }
                    key={addressItem._id}
                  >
                    {/* DEFAULT LABEL */}

                    {addressItem.isDefault && (
                      <span className="default-address-label">DEFAULT</span>
                    )}

                    {/* ADDRESS NAME */}

                    <h3>{addressItem.fullName}</h3>

                    {/* ADDRESS */}

                    <p>{addressItem.address}</p>

                    {/* CITY + STATE */}

                    <p>
                      {addressItem.city}
                      {", "}
                      {addressItem.state}
                    </p>

                    {/* PINCODE */}

                    <p>{addressItem.pincode}</p>

                    {/* ADDRESS ACTIONS */}

                    <div className="address-actions">
                      {/* SET DEFAULT */}

                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addressItem._id)}
                        disabled={addressItem.isDefault}
                      >
                        {addressItem.isDefault ? "DEFAULT" : "SET DEFAULT"}
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() => handleEditAddress(addressItem)}
                      >
                        EDIT
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => setDeleteAddressId(addressItem._id)}
                      >
                        DELETE
                      </button>
                    </div>

                    {/* DELETE CONFIRMATION */}

                    {deleteAddressId === addressItem._id && (
                      <div className="delete-confirmation">
                        <span>Delete this address?</span>

                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addressItem._id)}
                        >
                          YES, DELETE
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteAddressId(null)}
                        >
                          CANCEL
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ==================================
              LOGOUT
          ================================== */}

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            LOG OUT
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
