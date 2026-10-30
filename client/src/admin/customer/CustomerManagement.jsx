import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminFooter from "../bars/AdminFooter";
import AdminNavbar from "../bars/AdminNavbar";
import api from "../../services/api";

function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
const customersPerPage = 10;
const [search, setSearch] = useState("");

  const handleCustomerStatus = async (customerId) => {
    try {
      const token = sessionStorage.getItem("adminToken");

     const response = await api.patch(
  `/admin/customers/${customerId}/status`,
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

      const data = response.data;

      // Update the customer in the table
      setCustomers((previousCustomers) =>
        previousCustomers.map((customer) =>
          customer._id === customerId
            ? {
                ...customer,
                isActive: data.customer.isActive,
              }
            : customer,
        ),
      );
    } catch (error) {
      console.error("Customer status update error:", error);

      alert("Something went wrong. Please try again.");
    }
  };

 const filteredCustomers = customers.filter((customer) =>
  customer.name?.toLowerCase().includes(search.trim().toLowerCase())
);

const totalPages = Math.ceil(
  filteredCustomers.length / customersPerPage
);

const safeCurrentPage = Math.min(
  currentPage,
  Math.max(totalPages, 1)
);

const startIndex = (safeCurrentPage - 1) * customersPerPage;

const currentCustomers = filteredCustomers.slice(
  startIndex,
  startIndex + customersPerPage
);

useEffect(() => {
  setCurrentPage(1);
}, [search]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = sessionStorage.getItem("adminToken");

        const response = await api.get("/admin/customers", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        const data = response.data;

        setCustomers(data.customers);
      } catch (error) {
        console.error("Customer fetch error:", error);

        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="customer-management-page">
      <AdminNavbar />

      <main className="customer-management-content">
        <h1>CUSTOMER MANAGEMENT</h1>

        <p className="customer-management-subtitle">
          Manage registered ESSENZA customers
        </p>

        <div className="customer-search-container">
  <input
    type="search"
    placeholder="Search customer by name..."
    value={search}
    onChange={(event) => setSearch(event.target.value)}
  />
</div>

        {loading && <p>Loading customers...</p>}

        {error && <p className="customer-error">{error}</p>}

        {!loading && !error && (
          <div className="customer-table-container">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>VERIFICATION</th>
                  <th>STATUS</th>
                  <th>REGISTERED</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
               {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-customers">
                     {search.trim()
  ? "No customers match your search"
  : "No customers found"}
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.name}</td>

                      <td>{customer.email}</td>

                      <td>
                        {customer.isEmailVerified ? "Verified" : "Not Verified"}
                      </td>

                      <td>{customer.isActive ? "Active" : "Inactive"}</td>

                      <td>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        <button
                          className="customer-view-button"
                          onClick={() =>
                            navigate(`/admin/customers/${customer._id}`)
                          }
                        >
                          VIEW
                        </button>

                        <button
                          className={
                            customer.isActive
                              ? "customer-block-button"
                              : "customer-unblock-button"
                          }
                          onClick={() => handleCustomerStatus(customer._id)}
                        >
                          {customer.isActive ? "BLOCK" : "UNBLOCK"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {filteredCustomers.length > 0 && totalPages > 1 && (
  <div className="customer-pagination">
    <button
      type="button"
      onClick={() => setCurrentPage((page) => page - 1)}
      disabled={safeCurrentPage === 1}
    >
      ← PREVIOUS
    </button>

    <span>
      PAGE {safeCurrentPage} OF {totalPages}
    </span>

    <button
      type="button"
      onClick={() => setCurrentPage((page) => page + 1)}
      disabled={safeCurrentPage === totalPages}
    >
      NEXT →
    </button>
  </div>
)}
          </div>
        )}
      </main>

      <AdminFooter />
    </div>
  );
}

export default CustomerManagement;
