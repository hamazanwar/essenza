import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  const handleClose = () => {
    navigate("/my-orders");
  };

  if (!order) {
    return (
      <>
        <Navbar />

        <main className="order-confirmation-page">
          <div className="order-confirmation-overlay">
            <div className="order-confirmation-modal">
              <button
                type="button"
                className="order-confirmation-close"
                onClick={() => navigate("/shop")}
              >
                ×
              </button>

              <h2>ORDER DETAILS NOT FOUND</h2>

              <p>
                We could not find the order details.
              </p>

              <button
                type="button"
                className="order-confirmation-primary-button"
                onClick={() => navigate("/shop")}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="order-confirmation-page">

        <div className="order-confirmation-overlay">

          <div className="order-confirmation-modal">

            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="order-confirmation-close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>

            {/* SUCCESS ICON */}

            <div className="order-confirmation-icon">
              ✓
            </div>

            {/* TITLE */}

            <h1>ORDER CONFIRMED</h1>

            <p className="order-confirmation-message">
              Thank you for your order.
              <br />
              Your order has been placed successfully.
            </p>

            {/* ORDER INFORMATION */}

            <div className="order-confirmation-details">

              <div className="order-confirmation-detail-row">
                <span>ORDER ID</span>

                <strong>
                  #{order._id?.slice(-8).toUpperCase()}
                </strong>
              </div>

              <div className="order-confirmation-detail-row">
                <span>PAYMENT</span>

                <strong>
                  {order.paymentMethod === "COD"
                    ? "CASH ON DELIVERY"
                    : "ONLINE PAYMENT"}
                </strong>
              </div>

              <div className="order-confirmation-detail-row">
                <span>STATUS</span>

                <strong>
                  {order.orderStatus}
                </strong>
              </div>

              <div className="order-confirmation-detail-row total">
                <span>TOTAL</span>

                <strong>
                  ₹{order.totalAmount}
                </strong>
              </div>

            </div>

            {/* BUTTONS */}

            <div className="order-confirmation-actions">

              <button
                type="button"
                className="order-confirmation-primary-button"
                onClick={() => navigate("/my-orders")}
              >
                VIEW MY ORDERS
              </button>

              <button
                type="button"
                className="order-confirmation-secondary-button"
                onClick={() => navigate("/shop")}
              >
                CONTINUE SHOPPING
              </button>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default OrderConfirmation;