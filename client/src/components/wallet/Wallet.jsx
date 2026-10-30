import { useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const API_URL = "/wallet";

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await api.get(API_URL, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      const walletData = response.data.data;

      setBalance(walletData.balance);
      setAvailableBalance(
        Number(walletData.balance) - Number(walletData.reservedBalance || 0),
      );
      setTransactions(walletData.transactions);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load wallet details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    setSuccess("");
    const enteredAmount = Number(amount);

    if (
      !Number.isFinite(enteredAmount) ||
      enteredAmount < 1 ||
      Math.round(enteredAmount * 100) !== enteredAmount * 100
    ) {
      setError(
        "Enter a valid amount of at least ₹1, with up to two decimal places.",
      );
      return;
    }

    try {
      setPaymentLoading(true);
      setError("");

      // Load Razorpay Checkout.js
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Unable to load Razorpay Checkout."));
          document.body.appendChild(script);
        });
      }

      const token = sessionStorage.getItem("token");

      // Create Razorpay order
      const orderResponse = await api.post(
  `${API_URL}/top-up/create-order`,
  { amount: enteredAmount },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

      const order = orderResponse.data.data;

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ESSENZA",
        description: "Wallet Top-up",
        order_id: order.razorpayOrderId,

        handler: async (paymentResponse) => {
          try {
            // Verify payment on the backend
            await api.post(
  `${API_URL}/top-up/verify`,
  {
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_signature: paymentResponse.razorpay_signature,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);
            setAmount("");
            setSuccess("Money added to your wallet successfully!");
            await loadWallet();
            setPaymentLoading(false);
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support if money was deducted.",
            );
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },

        theme: {
          color: "#d9bd83",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description || "Payment failed. Please try again.",
        );
        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start wallet payment.",
      );
      setPaymentLoading(false);
    }
  };

  const handleWithdrawalRequest = async () => {
    setError("");
    setSuccess("");

    const requestedAmount = Number(withdrawAmount);

    if (
      withdrawAmount.trim() === "" ||
      !Number.isFinite(requestedAmount) ||
      requestedAmount < 1 ||
      Math.round(requestedAmount * 100) !== requestedAmount * 100
    ) {
      setError(
        "Enter a valid withdrawal amount of at least ₹1, with up to two decimal places.",
      );
      return;
    }

    if (requestedAmount > availableBalance) {
      setError("Insufficient wallet balance for this withdrawal.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const response = await api.post(
  `${API_URL}/withdraw`,
  { amount: requestedAmount },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

      setSuccess(
        response.data.message || "Withdrawal request submitted successfully.",
      );

      setWithdrawAmount("");
      setShowWithdraw(false);

      await loadWallet();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to submit withdrawal request. Please try again.",
      );
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  if (loading) {
    return <div className="wallet-page">Loading wallet...</div>;
  }

  const getTransactionLabel = (transaction) => {
  const source = String(transaction.source || "").toUpperCase();
  const type = String(transaction.type || "").toUpperCase();
  const status = String(transaction.status || "").toUpperCase();
  const description = String(transaction.description || "");

  // Withdrawals must not be displayed as refunds.
  if (
    source.includes("WITHDRAW") ||
    description.toUpperCase().includes("WITHDRAW")
  ) {
    if (status === "APPROVED") {
      return "Withdrawal Approved — Payout Pending";
    }

    if (status === "PENDING") {
      return "Withdrawal Request Pending";
    }

    if (status === "REJECTED") {
      return "Withdrawal Request Rejected";
    }

    return "Wallet Withdrawal";
  }

  if (source.includes("REFUND") || description.toUpperCase().includes("REFUND")) {
    return "Refund";
  }

  if (source.includes("TOP_UP") || source.includes("TOPUP")) {
    return "Wallet Top-up";
  }

  return description || source.replaceAll("_", " ") || type;
};

const isCreditTransaction = (transaction) => {
  return String(transaction.type || "").toUpperCase() === "CREDIT";
};

  return (
    <div>
      <Navbar />
      <div className="wallet-page">
        <div className="wallet-container">
          <h1>My Wallet</h1>
          <p className="wallet-subtitle">
            Manage your balance and view your transactions.
          </p>

          <div className="wallet-balance-card">
            <p>Available Balance</p>
            <h2>
              {availableBalance.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </h2>

            <div className="wallet-topup">
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={paymentLoading}
              />

              <button
                type="button"
                className="wallet-add-button"
                onClick={handleAddMoney}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "+ Add Money"}
              </button>

              <button
                type="button"
                className="wallet-withdraw-button"
                onClick={() => {
                  setSuccess("");
                  setError("");
                  setShowWithdraw(!showWithdraw);
                }}
              >
                Withdraw Money
              </button>
            </div>

            {showWithdraw && (
              <div className="wallet-withdraw-panel">
                <h3>Withdraw Money</h3>

                <p>
                  Available balance:{" "}
                  {balance.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </p>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter withdrawal amount (₹)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />

                <p className="wallet-withdraw-note">
                  Withdrawal requests require a verified payout destination.
                </p>

                <button
                  type="button"
                  className="wallet-add-button"
                  onClick={handleWithdrawalRequest}
                >
                  Request Withdrawal
                </button>
              </div>
            )}
          </div>

          {success && (
            <div className="wallet-success" role="status">
              <span>✓</span>
              <span>{success}</span>
              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss success message"
              >
                ×
              </button>
            </div>
          )}

          {error && <p className="wallet-error">{error}</p>}

          <div className="wallet-transactions">
            <h2>Recent Transactions</h2>

            {transactions.length === 0 ? (
              <p className="wallet-empty">No transactions yet.</p>
            ) : (
              transactions.map((transaction) => (
                <div className="wallet-transaction" key={transaction._id}>
                  <div>
                    <h3>{getTransactionLabel(transaction)}</h3>
                    <p>
                      {new Date(transaction.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                 <strong
  className={
    isCreditTransaction(transaction)
      ? "wallet-credit"
      : "wallet-debit"
  }
>
  {isCreditTransaction(transaction) ? "+" : "-"}
  {Number(transaction.amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  })}
</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Wallet;
