import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";
import api from "../../services/api";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);
const [showAllTransactions, setShowAllTransactions] = useState(false);

  const [reviewLoadingId, setReviewLoadingId] = useState(null);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawalConfirmation, setWithdrawalConfirmation] = useState(null);
  const [withdrawalNote, setWithdrawalNote] = useState("");

  const sortedWithdrawalRequests = [...withdrawalRequests].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

const visibleWithdrawalRequests = showAllWithdrawals
  ? sortedWithdrawalRequests
  : sortedWithdrawalRequests.slice(0, 5);

const sortedTransactions = [...transactions].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

const visibleTransactions = showAllTransactions
  ? sortedTransactions
  : sortedTransactions.slice(0, 5);

  const fetchCustomerWallet = async () => {
    try {
      setWalletLoading(true);
      setWalletError("");

      const token = localStorage.getItem("adminToken");

      const response = await api.get(`/admin/customers/${id}/wallet`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      setWallet(response.data.wallet);
      setTransactions(response.data.transactions || []);
      setWithdrawalRequests(response.data.withdrawalRequests || []);
    } catch (error) {
      console.error("Customer wallet fetch error:", error);

      setWalletError(
        error.response?.data?.message || "Failed to load customer wallet.",
      );
    } finally {
      setWalletLoading(false);
    }
  };

  const handleReviewWithdrawal = async (requestId, action) => {
    try {
      setReviewLoadingId(requestId);
      setReviewMessage("");
      setReviewError("");

      const token = localStorage.getItem("adminToken");

      const response = await api.patch(
  `/admin/customers/${id}/wallet/withdrawals/${requestId}`,
  {
    action,
    adminNote: withdrawalNote.trim(),
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

      setReviewMessage(
        response.data.message || "Withdrawal request reviewed successfully.",
      );

      setWithdrawalConfirmation(null);
      setWithdrawalNote("");

      await fetchCustomerWallet();
    } catch (error) {
      console.error("Withdrawal review error:", error);

      setReviewError(
        error.response?.data?.message ||
          "Failed to review withdrawal request. Please try again.",
      );

      setWithdrawalConfirmation(null);
    } finally {
      setReviewLoadingId(null);
    }
  };

  
  const handleCompleteWithdrawal = async (requestId) => {
    try {
      setReviewLoadingId(requestId);
      setReviewMessage("");
      setReviewError("");

      const token = localStorage.getItem("adminToken");

      const response = await api.patch(
        `/admin/customers/${id}/wallet/withdrawals/${requestId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReviewMessage(
        response.data.message || "Withdrawal payout completed successfully.",
      );

      await fetchCustomerWallet();
    } catch (error) {
      console.error("Complete withdrawal payout error:", error);

      setReviewError(
        error.response?.data?.message ||
          "Failed to complete withdrawal payout.",
      );
    } finally {
      setReviewLoadingId(null);
    }
  };


  useEffect(() => {
    fetchCustomerWallet();
  }, [id]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const response = await api.get(`/admin/customers/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        const data = response.data;

        setCustomer(data.customer);
        setAddresses(data.addresses);
      } catch (error) {
        console.error("Customer details fetch error:", error);

        setError(
          error.response?.data?.message ||
            "Something went wrong. Please try again.",
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
                      : `${api.defaults.baseURL.replace(/\/api$/, "")}${customer.profileImage}`
                  }
                  alt=""
                />
              ) : (
                <div className="customer-profile-placeholder">👤</div>
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
                <p>{customer.isEmailVerified ? "Verified" : "Not Verified"}</p>
              </div>

              <div>
                <span>REGISTERED</span>
                <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
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
                <div className="customer-address-card" key={address._id}>
                  {address.isDefault && (
                    <span className="default-address-label">
                      DEFAULT ADDRESS
                    </span>
                  )}

                  <h3>{address.fullName}</h3>

<p>Phone: {address.phoneNumber || "Not provided"}</p>

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

        {/* WALLET MANAGEMENT */}

        <section className="customer-details-card">
          <h2>WALLET MANAGEMENT</h2>

          {walletLoading ? (
            <p>Loading wallet details...</p>
          ) : walletError ? (
            <p className="customer-error">{walletError}</p>
          ) : !wallet ? (
            <p>This customer has not created a wallet yet.</p>
          ) : (
            <>
              <div className="wallet-admin-summary">
                <div className="wallet-admin-stat">
                  <span>TOTAL BALANCE</span>
                  <h3>
                    {Number(wallet.balance).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </h3>
                </div>

                <div className="wallet-admin-stat">
                  <span>RESERVED BALANCE</span>
                  <h3>
                    {Number(wallet.reservedBalance || 0).toLocaleString(
                      "en-IN",
                      {
                        style: "currency",
                        currency: "INR",
                      },
                    )}
                  </h3>
                </div>

                <div className="wallet-admin-stat">
                  <span>AVAILABLE BALANCE</span>
                  <h3>
                    {Number(wallet.availableBalance).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </h3>
                </div>
              </div>

              <p className="wallet-admin-status">
                Wallet status:{" "}
                <strong>{wallet.isActive ? "Active" : "Inactive"}</strong>
              </p>

              {/* WITHDRAWAL REQUESTS */}

              <div className="wallet-admin-history">
                <h3>WITHDRAWAL REQUESTS</h3>

                {reviewMessage && (
                  <p className="wallet-review-success">{reviewMessage}</p>
                )}

                {reviewError && <p className="customer-error">{reviewError}</p>}

                {withdrawalRequests.length === 0 ? (
                  <p>No withdrawal requests found for this customer.</p>
                ) : (
                  <div className="wallet-admin-table-wrapper">
                    <table className="wallet-admin-table">
                      <thead>
                        <tr>
                          <th>REQUEST DATE</th>
                          <th>AMOUNT</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleWithdrawalRequests.map((request) => (
                          <tr key={request._id}>
                            <td>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              {Number(request.amount).toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              })}
                            </td>

                            <td>{request.status}</td>

                            <td>
                              
  {request.status === "PENDING" ? (
    <div className="withdrawal-admin-actions">
      <button
        type="button"
        className="withdrawal-approve-button"
        disabled={reviewLoadingId !== null}
        onClick={() =>
          setWithdrawalConfirmation({
            requestId: request._id,
            action: "APPROVE",
          })
        }
      >
        Approve
      </button>

      <button
        type="button"
        className="withdrawal-reject-button"
        disabled={reviewLoadingId !== null}
        onClick={() =>
          setWithdrawalConfirmation({
            requestId: request._id,
            action: "REJECT",
          })
        }
      >
        Reject
      </button>
    </div>
  ) : request.status === "APPROVED" ? (
    <button
      type="button"
      className="withdrawal-approve-button"
      disabled={reviewLoadingId !== null}
      onClick={() => handleCompleteWithdrawal(request._id)}
    >
      {reviewLoadingId === request._id
        ? "Processing..."
        : "Complete Payout"}
    </button>
  ) : (
    "—"
  )}

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                            </div>

              {withdrawalRequests.length > 5 && (
                <button
                  type="button"
                  className="wallet-history-toggle"
                  onClick={() =>
                    setShowAllWithdrawals((previous) => !previous)
                  }
                >
                  {showAllWithdrawals ? "SHOW LESS" : "SHOW ALL"}
                </button>
              )}

              {/* TRANSACTION HISTORY */}

              <div className="wallet-admin-history">
                <h3>TRANSACTION HISTORY</h3>

                {transactions.length === 0 ? (
                  <p>No wallet transactions found.</p>
                ) : (
                  <div className="wallet-admin-table-wrapper">
                    <table className="wallet-admin-table">
                      <thead>
                        <tr>
                          <th>DATE</th>
                          <th>TYPE</th>
                          <th>SOURCE</th>
                          <th>AMOUNT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleTransactions.map((transaction) => (
                          <tr key={transaction._id}>
                            <td>
                              {new Date(
                                transaction.createdAt,
                              ).toLocaleDateString()}
                            </td>
                            <td>{transaction.type}</td>
                            <td>{transaction.source}</td>
                            <td>
                              {Number(transaction.amount).toLocaleString(
                                "en-IN",
                                {
                                  style: "currency",
                                  currency: "INR",
                                },
                              )}
                            </td>
                            <td>{transaction.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {transactions.length > 5 && (
  <button
    type="button"
    className="wallet-history-toggle"
    onClick={() =>
      setShowAllTransactions((previous) => !previous)
    }
  >
    {showAllTransactions ? "SHOW LESS" : "SHOW ALL"}
  </button>
)}
            </>
          )}
        </section>

        {withdrawalConfirmation && (
          <div
            className="withdrawal-modal-overlay"
            onClick={() => {
              if (!reviewLoadingId) {
                setWithdrawalConfirmation(null);
                setWithdrawalNote("");
              }
            }}
          >
            <div
              className="withdrawal-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="withdrawal-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="withdrawal-modal-eyebrow">
                ESSENZA WALLET MANAGEMENT
              </p>

              <h2 id="withdrawal-modal-title">
                {withdrawalConfirmation.action === "APPROVE"
                  ? "Approve Withdrawal?"
                  : "Reject Withdrawal?"}
              </h2>

              <p className="withdrawal-modal-description">
                {withdrawalConfirmation.action === "APPROVE"
                  ? "Are you sure you want to approve this withdrawal request?"
                  : "Are you sure you want to reject this withdrawal request?"}
              </p>

              <label htmlFor="withdrawal-admin-note">
                Admin note (optional)
              </label>

              <textarea
                id="withdrawal-admin-note"
                value={withdrawalNote}
                onChange={(event) => setWithdrawalNote(event.target.value)}
                placeholder="Enter a note..."
                rows={3}
                disabled={reviewLoadingId !== null}
              />

              <div className="withdrawal-modal-actions">
                <button
                  type="button"
                  className="withdrawal-modal-cancel"
                  disabled={reviewLoadingId !== null}
                  onClick={() => {
                    setWithdrawalConfirmation(null);
                    setWithdrawalNote("");
                  }}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  className={
                    withdrawalConfirmation.action === "APPROVE"
                      ? "withdrawal-modal-confirm"
                      : "withdrawal-modal-confirm reject"
                  }
                  disabled={reviewLoadingId !== null}
                  onClick={() =>
                    handleReviewWithdrawal(
                      withdrawalConfirmation.requestId,
                      withdrawalConfirmation.action,
                    )
                  }
                >
                  {reviewLoadingId !== null
                    ? "PROCESSING..."
                    : withdrawalConfirmation.action === "APPROVE"
                      ? "CONFIRM APPROVAL"
                      : "CONFIRM REJECTION"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <AdminFooter />
    </div>
  );
}

export default CustomerDetails;
