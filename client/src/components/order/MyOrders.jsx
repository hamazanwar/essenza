import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function MyOrders() {
  const navigate = useNavigate();

  const handleViewOrder = (orderId) => {
    navigate(`/my-orders/${orderId}`);
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Fetch orders error:", error);

        setError(
          error.response?.data?.message || "Failed to load your orders.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      setCancelling(true);
      setError("");

      const response = await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? response.data.order : order,
        ),
      );

      // Close confirmation box
      setCancelOrderId(null);
    } catch (error) {
      console.error("Cancel order error:", error);

      setError(error.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="my-orders-page">
          <div className="my-orders-message">Loading your orders...</div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="my-orders-page">
        <div className="my-orders-container">
          <div className="my-orders-header">
            <h1>MY ORDERS</h1>

            <button type="button" onClick={() => navigate("/shop")}>
              CONTINUE SHOPPING
            </button>
          </div>

          {error && <p className="my-orders-error">{error}</p>}

          {!error && orders.length === 0 && (
            <div className="my-orders-empty">
              <h2>NO ORDERS YET</h2>

              <p>You haven't placed any orders yet.</p>

              <button type="button" onClick={() => navigate("/shop")}>
                START SHOPPING
              </button>
            </div>
          )}

          {orders.length > 0 && (
            <div className="my-orders-list">
              {orders.map((order) => (
                <article
  key={order._id}
  className="my-order-card"
>
                  <div className="my-order-header">
                    <div>
                      <span>ORDER ID</span>

                      <strong>#{order._id?.slice(-8).toUpperCase()}</strong>
                    </div>

                    <div>
                      <span>ORDER DATE</span>

                      <strong>{formatDate(order.createdAt)}</strong>
                    </div>

                    <div
                      className={`my-order-status ${order.orderStatus.toLowerCase()}`}
                    >
                      {order.orderStatus}
                    </div>
                  </div>

                  <div className="my-order-items">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order._id}-${item.variantId}-${index}`}
                        className="my-order-item"
                      >
                        <div className="my-order-item-image">
                          {item.productImage ? (
                            <img
                              src={`http://localhost:5000${item.productImage}`}
                              alt={item.productName}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </div>
                        <div className="my-order-item-details">
                          <h3>{item.productName}</h3>

                          <p>Size: {item.size}</p>
                          <p>Quantity: {item.quantity}</p>

                          <button
                            type="button"
                            className="my-order-view-details-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleViewOrder(order._id);
                            }}
                          >
                            VIEW DETAILS →
                          </button>
                        </div>

                        <div className="my-order-item-price">
                          ₹{item.totalPrice}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="my-order-footer">
                    <div>
                      <span>PAYMENT</span>

                      <strong>
                        {order.paymentMethod === "COD"
                          ? "CASH ON DELIVERY"
                          : "ONLINE PAYMENT"}
                      </strong>
                    </div>

                    <div>
                      <span>TOTAL</span>

                      <strong>₹{order.totalAmount}</strong>
                    </div>

                    {order.orderStatus === "PENDING" && (
                      <button
                        type="button"
                        className="my-order-cancel-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCancelOrderId(order._id);
                        }}
                      >
                        CANCEL ORDER
                      </button>
                    )}
                  </div>

                  {cancelOrderId === order._id && (
                    <div className="cancel-order-confirmation">
                      <div className="cancel-order-confirmation-content">
                        <h3>CANCEL ORDER?</h3>

                        <p>Are you sure you want to cancel this order?</p>

                        <div className="cancel-order-confirmation-actions">
                          <button
                            type="button"
                            className="cancel-order-keep-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setCancelOrderId(null);
                            }}
                            disabled={cancelling}
                          >
                            KEEP ORDER
                          </button>

                          <button
                            type="button"
                            className="cancel-order-confirm-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCancelOrder(order._id);
                            }}
                            disabled={cancelling}
                          >
                            {cancelling ? "CANCELLING..." : "CANCEL ORDER"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default MyOrders;
