
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

// Load Razorpay Checkout securely from Razorpay's hosted script.
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkoutData = location.state;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  if (!checkoutData) {
    return (
      <>
        <Navbar />

        <main className="payment-page">
          <div className="payment-message">
            <h2>Payment details not found.</h2>

            <button
              type="button"
              onClick={() => navigate("/shop")}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const {
    checkoutItems = [],
    selectedAddress = null,
    subtotal = 0,
    deliveryCharge = 0,
    total = 0,
  } = checkoutData;

  const handlePayment = async () => {
    if (!paymentMethod || placingOrder) {
      return;
    }

    if (!selectedAddress?._id) {
      setError("Please select a delivery address.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!checkoutItems.length) {
      setError("Your order has no items.");
      return;
    }

    setPlacingOrder(true);
    setError("");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const orderItems = checkoutItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: Number(item.quantity),
    }));

    // Keep the existing COD flow.
    if (paymentMethod === "cod") {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/orders",
          {
            addressId: selectedAddress._id,
            items: orderItems,
            paymentMethod: "COD",
          },
          { headers }
        );

        navigate("/order-confirmation", {
          state: {
            order: response.data.order,
          },
        });
      } catch (error) {
        console.error("Place COD order error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to place order."
        );
      } finally {
        setPlacingOrder(false);
      }

      return;
    }

    // Start Razorpay online payment.
    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please check your internet connection."
        );
      }

      // The backend calculates the real amount using database prices.
      const response = await axios.post(
        "http://localhost:5000/api/orders/create-payment-order",
        {
          addressId: selectedAddress._id,
          items: orderItems,
        },
        { headers }
      );

      const {
        keyId,
        razorpayOrderId,
        amount,
        currency,
      } = response.data;

      if (!keyId || !razorpayOrderId || !amount) {
        throw new Error(
          "Invalid payment details received from the server."
        );
      }

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "ESSENZA",
        description: "Perfume order payment",
        order_id: razorpayOrderId,

        handler: async (paymentResponse) => {
          try {
            setError("");

            // The backend verifies the signature and payment status.
            const verificationResponse = await axios.post(
              "http://localhost:5000/api/orders/verify-payment",
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              },
              { headers }
            );

            if (!verificationResponse.data?.order) {
              throw new Error(
                "Payment verification did not return an order."
              );
            }

            navigate("/order-confirmation", {
              state: {
                order: verificationResponse.data.order,
              },
            });
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setError(
              error.response?.data?.message ||
                "Payment was received, but order confirmation failed. Please contact support and do not pay again until the payment is checked."
            );
          } finally {
            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
          },
        },
      });

      razorpay.on("payment.failed", (event) => {
        console.error(
          "Razorpay payment failed:",
          event.error
        );

        setError(
          event.error?.description ||
            "Payment failed. Please try again."
        );

        setPlacingOrder(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Online payment error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start online payment."
      );

      setPlacingOrder(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="payment-page">
        <div className="payment-container">
          <h1>PAYMENT</h1>

          {error && (
            <p className="payment-error-message" role="alert">
              {error}
            </p>
          )}

          {/* DELIVERY ADDRESS */}
          <section className="payment-section">
            <h2>DELIVERY ADDRESS</h2>

            {selectedAddress && (
              <div className="payment-address-card">
                <strong>{selectedAddress.fullName}</strong>
                <p>{selectedAddress.address}</p>

                <p>
                  {selectedAddress.city},{" "}
                  {selectedAddress.state} -{" "}
                  {selectedAddress.pincode}
                </p>
              </div>
            )}
          </section>

          {/* ORDER SUMMARY */}
          <section className="payment-section">
            <h2>ORDER SUMMARY</h2>

            <div className="payment-items">
              {checkoutItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="payment-item"
                >
                  <div className="payment-item-image">
                    {item.productImage ? (
                      <img
                        src={`http://localhost:5000${item.productImage}`}
                        alt={item.productName}
                      />
                    ) : (
                      <div>No Image</div>
                    )}
                  </div>

                  <div className="payment-item-details">
                    <h3>{item.productName}</h3>
                    <p>Size: {item.size}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>

                  <div className="payment-item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAYMENT METHOD */}
          <section className="payment-section">
            <h2>PAYMENT METHOD</h2>

            <div className="payment-method-list">
              <label
                className={`payment-method-card ${
                  paymentMethod === "cod" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  disabled={placingOrder}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>CASH ON DELIVERY</strong>
                  <p>Pay when your order is delivered.</p>
                </div>
              </label>

              <label
                className={`payment-method-card ${
                  paymentMethod === "online" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  disabled={placingOrder}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>ONLINE PAYMENT</strong>
                  <p>Pay securely using Razorpay Checkout.</p>
                </div>
              </label>
            </div>
          </section>

          {/* PRICE SUMMARY */}
          <section className="payment-summary">
            <h2>PRICE SUMMARY</h2>

            <div className="payment-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="payment-summary-row">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0
                  ? "FREE"
                  : `₹${deliveryCharge}`}
              </span>
            </div>

            <div className="payment-summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              type="button"
              className="payment-button"
              onClick={handlePayment}
              disabled={!paymentMethod || placingOrder}
            >
              {placingOrder
                ? "PROCESSING..."
                : paymentMethod === "cod"
                ? "PLACE ORDER"
                : paymentMethod === "online"
                ? "PAY NOW"
                : "SELECT PAYMENT METHOD"}
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Payment;
