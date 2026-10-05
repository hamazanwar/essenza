import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";
import axios from "axios";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const response = await axios.get(
          `http://localhost:5000/api/admin/customers/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        setCustomer(data.customer);
        setAddresses(data.addresses);
      } catch (error) {
        console.error("Customer details fetch error:", error);

        setError(
          error.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="customer-details-page">
        <AdminNavbar />

        <main className="customer-details-content">
          <p>Loading customer details...</p>
        </main>

        <AdminFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-details-page">
        <AdminNavbar />

        <main className="customer-details-content">
          <p className="customer-error">{error}</p>

          <button
            className="customer-back-button"
            onClick={() => navigate("/admin/customers")}
          >
            BACK TO CUSTOMERS
          </button>
        </main>

        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="customer-details-page">
      <AdminNavbar />

      <main className="customer-details-content">
        <button
          className="customer-back-button"
          onClick={() => navigate("/admin/customers")}
        >
          ← BACK TO CUSTOMERS
        </button>

        <h1>CUSTOMER DETAILS</h1>

        <p className="customer-management-subtitle">
          View customer profile and saved addresses
        </p>

        {/* CUSTOMER PROFILE */}

        <section className="customer-details-card">
          <h2>PROFILE</h2>

          <div className="customer-profile-details">
            <div className="customer-profile-image">
              {customer.profileImage ? (
                <img
                  src={
                    customer.profileImage.startsWith("http")
                      ? customer.profileImage
                      : `http://localhost:5000${customer.profileImage}`
                  }
                  alt=""
                />
              ) : (
                <div className="customer-profile-placeholder">
                  👤
                </div>
              )}
            </div>

            <div className="customer-profile-info">
              <div>
                <span>NAME</span>
                <p>{customer.name}</p>
              </div>

              <div>
                <span>EMAIL</span>
                <p>{customer.email}</p>
              </div>

              <div>
                <span>STATUS</span>
                <p>{customer.isActive ? "Active" : "Inactive"}</p>
              </div>

              <div>
                <span>EMAIL VERIFICATION</span>
                <p>
                  {customer.isEmailVerified
                    ? "Verified"
                    : "Not Verified"}
                </p>
              </div>

              <div>
                <span>REGISTERED</span>
                <p>
                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ADDRESSES */}

        <section className="customer-details-card">
          <h2>ADDRESSES</h2>

          {addresses.length === 0 ? (
            <p className="no-customer-addresses">
              This customer has not added any addresses.
            </p>
          ) : (
            <div className="customer-address-list">
              {addresses.map((address) => (
                <div
                  className="customer-address-card"
                  key={address._id}
                >
                  {address.isDefault && (
                    <span className="default-address-label">
                      DEFAULT ADDRESS
                    </span>
                  )}

                  <h3>{address.fullName}</h3>

                  <p>{address.address}</p>

                  <p>
                    {address.city}, {address.state}
                  </p>

                  <p>{address.pincode}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <AdminFooter />
    </div>
  );
}

export default CustomerDetails;