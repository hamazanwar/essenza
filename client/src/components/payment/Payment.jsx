import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkoutData = location.state;

  const [paymentMethod, setPaymentMethod] = useState("");

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

  const handlePayment = () => {
    if (!paymentMethod) {
      return;
    }

    console.log("Payment method:", paymentMethod);
    console.log("Checkout items:", checkoutItems);
    console.log("Selected address:", selectedAddress);
    console.log("Total:", total);

    // Order creation will be implemented next.
  };

  return (
    <>
      <Navbar />

      <main className="payment-page">
        <div className="payment-container">

          <h1>PAYMENT</h1>

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

                    <p>
                      Quantity: {item.quantity}
                    </p>
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
                  paymentMethod === "cod"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>
                    CASH ON DELIVERY
                  </strong>

                  <p>
                    Pay when your order is delivered.
                  </p>
                </div>
              </label>

              <label
                className={`payment-method-card ${
                  paymentMethod === "online"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                />

                <div>
                  <strong>
                    ONLINE PAYMENT
                  </strong>

                  <p>
                    Pay securely using online payment.
                  </p>
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
              disabled={!paymentMethod}
            >
              {paymentMethod === "cod"
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