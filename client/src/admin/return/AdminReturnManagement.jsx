import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminFooter from "../bars/AdminFooter";
import AdminNavbar from "../bars/AdminNavbar";

function AdminReturnManagement() {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        setError("Admin session not found. Please log in again.");
        return;
      }

      const response = await api.get("/admin/returns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReturnRequests(response.data.returnRequests || []);
    } catch (requestError) {
      console.error("Fetch return requests error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to load return and exchange requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  useEffect(() => {
    const lastPage = Math.max(
      1,
      Math.ceil(
        returnRequests.reduce(
          (total, request) => total + (request.items || []).length,
          0,
        ) / itemsPerPage,
      ),
    );

    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [returnRequests, currentPage]);

  const updateRequestItem = async (request, item, decision) => {
    try {
      setUpdating(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      await api.patch(
        `/admin/returns/${request._id}`,
        {
          itemId: item._id,
          decision,
          adminNote: adminNote.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedRequest(null);
      setAdminNote("");

      await fetchReturnRequests();
    } catch (requestError) {
      console.error("Update return request error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update this request.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const completeReturn = async (request, item) => {
    try {
      setUpdating(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      await api.patch(
        `/admin/returns/${request._id}/complete`,
        { itemId: item._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchReturnRequests();
    } catch (requestError) {
      console.error("Complete return error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to complete this return.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const completeExchange = async (request, item) => {
    try {
      setUpdating(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      await api.patch(
        `/admin/returns/${request._id}/complete-exchange`,
        { itemId: item._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchReturnRequests();
    } catch (requestError) {
      console.error("Complete exchange error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to complete this exchange.",
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) =>
    String(status || "PENDING").replaceAll("_", " ");

  // Flatten requests into individual return/exchange items
  // Filter return/exchange items by customer name
const allReturnItems = returnRequests
  .flatMap((request) =>
    (request.items || []).map((item) => ({
      request,
      item,
    })),
  )
  .filter(({ request, item }) => {
    const search = searchTerm.trim().toLowerCase();

    const customerName = String(
      request.userId?.name ||
        request.orderId?.userId?.name ||
        "",
    ).toLowerCase();

    const matchesSearch = customerName.includes(search);

    const matchesType =
      typeFilter === "ALL" || request.requestType === typeFilter;

    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(allReturnItems.length / itemsPerPage),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentReturnItems = allReturnItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <>
      <AdminNavbar />
      <div className="admin-return-management-page">
        <main className="admin-return-management-content">
          <div className="admin-return-heading">
            <div>
              <h1>RETURN & EXCHANGE MANAGEMENT</h1>
              <p>Review customer return and exchange requests.</p>
            </div>

            <button
              type="button"
              onClick={fetchReturnRequests}
              disabled={loading || updating}
            >
              {loading ? "LOADING..." : "REFRESH"}
            </button>
          </div>

          <div className="admin-return-search">
  <input
    type="text"
    placeholder="Search by customer name..."
    value={searchTerm}
    onChange={(event) => {
      setSearchTerm(event.target.value);
      setCurrentPage(1);
    }}
  />

  {searchTerm && (
    <button
      type="button"
      onClick={() => {
        setSearchTerm("");
        setCurrentPage(1);
      }}
    >
      CLEAR
    </button>
  )}
</div>

<div className="admin-return-filters">

  <div>
    <label htmlFor="return-type-filter">REQUEST TYPE</label>

    <select
      id="return-type-filter"
      value={typeFilter}
      onChange={(event) => {
        setTypeFilter(event.target.value);
        setCurrentPage(1);
      }}
    >
      <option value="ALL">ALL TYPES</option>
      <option value="RETURN">RETURN</option>
      <option value="EXCHANGE">EXCHANGE</option>
    </select>
  </div>

  <div>
    <label htmlFor="return-status-filter">REQUEST STATUS</label>

    <select
      id="return-status-filter"
      value={statusFilter}
      onChange={(event) => {
        setStatusFilter(event.target.value);
        setCurrentPage(1);
      }}
    >
      <option value="ALL">ALL STATUSES</option>
      <option value="PENDING">PENDING</option>
      <option value="APPROVED">APPROVED</option>
      <option value="REJECTED">REJECTED</option>
      <option value="COMPLETED">COMPLETED</option>
    </select>
  </div>

  <button
    type="button"
    onClick={() => {
      setTypeFilter("ALL");
      setStatusFilter("ALL");
      setSearchTerm("");
      setCurrentPage(1);
    }}
  >
    CLEAR FILTERS
  </button>

</div>

          {error && (
            <p className="admin-return-error" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p className="admin-return-message">Loading requests...</p>
          ) : allReturnItems.length === 0 ? (
            <div className="admin-return-empty">
              <h2>
  {searchTerm.trim()
    ? "NO MATCHING REQUESTS FOUND"
    : "NO REQUESTS FOUND"}
</h2>

<p>
  {searchTerm.trim()
    ? "No return or exchange requests match this customer name."
    : "Customer return and exchange requests will appear here."}
</p>
            </div>
          ) : (
            <div className="admin-return-table-container">
              <table className="admin-return-table">
                <thead>
                  <tr>
                    <th>REQUEST</th>
                    <th>ORDER</th>
                    <th>CUSTOMER</th>
                    <th>PRODUCT</th>
                    <th>TYPE</th>
                    <th>QTY</th>
                    <th>REASON</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {currentReturnItems.map(({ request, item }) => (
                    <tr key={`${request._id}-${item._id}`}>
                      <td>
                        <strong>#{request._id.slice(-6).toUpperCase()}</strong>
                        <small>{item._id.slice(-6).toUpperCase()}</small>
                      </td>

                      <td>
                        #
                        {(request.orderId?._id || request.orderId || "")
                          .slice(-8)
                          .toUpperCase()}
                      </td>

                      <td>
  <strong>
    {request.userId?.name ||
      request.orderId?.userId?.name ||
      "Customer unavailable"}
  </strong>

  <small>
    {request.userId?.email ||
      request.orderId?.userId?.email ||
      ""}
  </small>
</td>

                      <td>
                        <strong>{item.productName}</strong>
                        <small>{item.size}</small>
                        {request.requestType === "EXCHANGE" &&
                          item.exchangeVariantId && (
                            <small>
                              Replacement:{" "}
                              {item.exchangeVariantId.size || "Selected"}
                            </small>
                          )}
                        {item.description && (
                          <small>Details: {item.description}</small>
                        )}
                      </td>

                      <td>{request.requestType}</td>
                      <td>{item.quantity}</td>
                      <td>{formatStatus(item.reason)}</td>
                      <td>
                        <span
                          className={`admin-return-status admin-return-status-${String(
                            item.status,
                          ).toLowerCase()}`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </td>
                      <td>{formatDate(request.createdAt)}</td>

                      <td>
                        {item.status === "PENDING" ? (
                          <button
                            type="button"
                            className="admin-return-action-button"
                            disabled={updating}
                            onClick={() => {
                              setSelectedRequest({ request, item });
                              setAdminNote("");
                            }}
                          >
                            REVIEW
                          </button>
                        ) : request.requestType === "RETURN" &&
                          item.status === "APPROVED" ? (
                          <button
                            type="button"
                            className="admin-return-action-button"
                            disabled={updating}
                            onClick={() => completeReturn(request, item)}
                          >
                            {updating ? "PROCESSING..." : "COMPLETE REFUND"}
                          </button>
                        ) : request.requestType === "EXCHANGE" &&
                          item.status === "APPROVED" ? (
                          <button
                            type="button"
                            className="admin-return-action-button"
                            disabled={updating}
                            onClick={() => {
                              const confirmed = window.confirm(
                                "Complete this exchange? The customer's wallet may be charged if the replacement costs more.",
                              );

                              if (confirmed) {
                                completeExchange(request, item);
                              }
                            }}
                          >
                            {updating ? "PROCESSING..." : "COMPLETE EXCHANGE"}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="admin-return-pagination">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ← PREVIOUS
                </button>

                <span>
                  PAGE {currentPage} OF {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage >= totalPages}
                >
                  NEXT →
                </button>
              </div>
            </div>
          )}
        </main>

        {selectedRequest && (
          <div className="admin-return-overlay">
            <form
              className="admin-return-review-modal"
              onSubmit={(event) => event.preventDefault()}
            >
              <button
                type="button"
                className="admin-return-modal-close"
                disabled={updating}
                onClick={() => setSelectedRequest(null)}
                aria-label="Close review"
              >
                ×
              </button>

              <p className="admin-return-eyebrow">ESSENZA CUSTOMER CARE</p>
              <h2>REVIEW REQUEST</h2>

              <p>
                <strong>Product:</strong> {selectedRequest.item.productName}
              </p>
              <p>
                <strong>Type:</strong> {selectedRequest.request.requestType}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedRequest.item.quantity}
              </p>
              <p>
                <strong>Reason:</strong>{" "}
                {formatStatus(selectedRequest.item.reason)}
              </p>
              <p>
                <strong>Customer details:</strong>{" "}
                {selectedRequest.item.description || "Not provided"}
              </p>

              <label htmlFor="admin-return-note">ADMIN NOTE (OPTIONAL)</label>
              <textarea
                id="admin-return-note"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                maxLength={1000}
                rows={3}
                disabled={updating}
                placeholder="Add a note for this decision..."
              />

              <div className="admin-return-review-actions">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    updateRequestItem(
                      selectedRequest.request,
                      selectedRequest.item,
                      "REJECTED",
                    )
                  }
                >
                  {updating ? "PLEASE WAIT..." : "REJECT"}
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    updateRequestItem(
                      selectedRequest.request,
                      selectedRequest.item,
                      "APPROVED",
                    )
                  }
                >
                  {updating ? "PLEASE WAIT..." : "APPROVE"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <AdminFooter />
    </>
  );
}

export default AdminReturnManagement;
