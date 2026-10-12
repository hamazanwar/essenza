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
  const [myReviews, setMyReviews] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

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
        try {
          const reviewsResponse = await axios.get(
            "http://localhost:5000/api/reviews/my-reviews",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          setMyReviews(reviewsResponse.data.reviews || []);
        } catch (reviewError) {
          console.error("Fetch reviews error:", reviewError);
        }
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

  const getProductId = (item) => {
    const product = item.productId;

    if (!product) return "";

    return typeof product === "object"
      ? String(product._id || "")
      : String(product);
  };

  const hasReviewed = (orderId, productId) => {
    return myReviews.some((review) => {
      const reviewOrderId =
        typeof review.orderId === "object"
          ? review.orderId?._id
          : review.orderId;

      const reviewProductId =
        typeof review.productId === "object"
          ? review.productId?._id
          : review.productId;

      return (
        String(reviewOrderId) === String(orderId) &&
        String(reviewProductId) === String(productId)
      );
    });
  };

  const openReviewForm = (order, item) => {
    setReviewTarget({
      orderId: order._id,
      productId: getProductId(item),
      productName: item.productName,
    });

    setRating(5);
    setComment("");
    setReviewMessage("");
    setReviewError("");
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!reviewTarget) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      setReviewSubmitting(true);
      setReviewError("");
      setReviewMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          productId: reviewTarget.productId,
          orderId: reviewTarget.orderId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMyReviews((previous) => [response.data.review, ...previous]);

      setReviewMessage("Your review has been submitted successfully.");
      setReviewTarget(null);
      setRating(5);
      setComment("");
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
          "Unable to submit your review. Please try again.",
      );
    } finally {
      setReviewSubmitting(false);
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
                <article key={order._id} className="my-order-card">
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
                          {String(order.orderStatus).toUpperCase() ===
                            "DELIVERED" &&
                            getProductId(item) &&
                            (hasReviewed(order._id, getProductId(item)) ? (
                              <p className="my-order-review-submitted">
                                ✓ REVIEW SUBMITTED
                              </p>
                            ) : (
                              <button
                                type="button"
                                className="my-order-write-review-button"
                                onClick={() => openReviewForm(order, item)}
                              >
                                WRITE REVIEW
                              </button>
                            ))}
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

          {reviewMessage && (
            <p className="my-order-review-success">{reviewMessage}</p>
          )}

          {reviewTarget && (
            <div className="my-review-overlay">
              <form className="my-review-form" onSubmit={handleSubmitReview}>
                <button
                  type="button"
                  className="my-review-close"
                  onClick={() => {
                    if (!reviewSubmitting) {
                      setReviewTarget(null);
                      setReviewError("");
                    }
                  }}
                  disabled={reviewSubmitting}
                  aria-label="Close review form"
                >
                  ×
                </button>

                <p className="my-review-eyebrow">ESSENZA REVIEWS</p>

                <h2>WRITE A REVIEW</h2>

                <p className="my-review-product-name">
                  {reviewTarget.productName}
                </p>

                <label>YOUR RATING</label>

                <div className="my-review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= rating ? "active" : ""}
                      onClick={() => setRating(star)}
                      disabled={reviewSubmitting}
                      aria-label={`${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <label htmlFor="my-review-comment">YOUR EXPERIENCE</label>

                <textarea
                  id="my-review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your experience with this fragrance..."
                  minLength={3}
                  maxLength={1000}
                  rows={5}
                  required
                  disabled={reviewSubmitting}
                />

                {reviewError && (
                  <p className="my-order-review-error">{reviewError}</p>
                )}

                <button
                  type="submit"
                  className="my-review-submit-button"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default MyOrders;
