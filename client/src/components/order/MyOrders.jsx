import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function MyOrders() {
  const navigate = useNavigate();

  const getImageUrl = (image) => {
  if (!image) return "";

  // Cloudinary image URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Old local server image path
  const serverUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");

  return `${serverUrl}${image.startsWith("/") ? image : `/${image}`}`;
};

  const handleViewOrder = (orderId) => {
    navigate(`/my-orders/${orderId}`);
  };

  const handleOpenReturnModal = (order, item) => {
  setSelectedReturnOrder(order);
  setSelectedReturnItem(item);
  setReturnType("RETURN");
  setReturnQuantity(1);
  setReturnReason("");
  setReturnDescription("");
  setReturnMessage("");
  setReturnError("");
  setExchangeVariants([]);
setExchangeVariantId("");
  setReturnModalOpen(true);
};


const handleReturnTypeChange = async (type) => {
  setReturnType(type);
  setExchangeVariants([]);
  setExchangeVariantId("");
  setReturnError("");

  if (type !== "EXCHANGE" || !selectedReturnItem) {
    return;
  }

  const productId = getProductId(selectedReturnItem);

  if (!productId) {
    setReturnError("Unable to identify this product.");
    return;
  }

  try {
    setExchangeVariantsLoading(true);

   const response = await api.get(`/products/${productId}`);

    const variants = response.data.product?.variants || [];

    console.table(
  variants.map((variant) => ({
    id: variant._id,
    size: variant.size,
    price: variant.price,
    stock: variant.stock,
  })),
);

    const currentVariantId =
      typeof selectedReturnItem.variantId === "object"
        ? selectedReturnItem.variantId?._id
        : selectedReturnItem.variantId;

    const availableVariants = variants.filter(
  (variant) => Number(variant.stock) > 0,
);

    setExchangeVariants(availableVariants);

    if (availableVariants.length === 0) {
      setReturnError("No alternative sizes are currently available.");
    }
  } catch (error) {
    console.error("Fetch exchange variants error:", error);

    setReturnError(
      error.response?.data?.message ||
        "Unable to load replacement sizes.",
    );
  } finally {
    setExchangeVariantsLoading(false);
  }
};


  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [myReturnRequests, setMyReturnRequests] = useState([]);
const [returnLoading, setReturnLoading] = useState(false);
const [returnModalOpen, setReturnModalOpen] = useState(false);
const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
const [selectedReturnItem, setSelectedReturnItem] = useState(null);
const [exchangeVariants, setExchangeVariants] = useState([]);
const [exchangeVariantId, setExchangeVariantId] = useState("");
const [exchangeVariantsLoading, setExchangeVariantsLoading] = useState(false);
const [returnType, setReturnType] = useState("RETURN");
const [returnQuantity, setReturnQuantity] = useState(1);
const [returnReason, setReturnReason] = useState("");
const [returnDescription, setReturnDescription] = useState("");
const [returnMessage, setReturnMessage] = useState("");
const [returnError, setReturnError] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

     const response = await api.get("/orders/my-orders", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
        setOrders(response.data.orders || []);
        try {
          const reviewsResponse = await api.get("/reviews/my-reviews", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

          setMyReviews(reviewsResponse.data.reviews || []);
          try {
 const returnResponse = await api.get("/returns/my", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

  setMyReturnRequests(returnResponse.data.returnRequests || []);
} catch (returnError) {
  console.error("Fetch return requests error:", returnError);
}
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
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      setCancelling(true);
      setError("");

      const response = await api.patch(
  `/orders/${orderId}/cancel`,
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
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      setReviewSubmitting(true);
      setReviewError("");
      setReviewMessage("");

     const response = await api.post(
  "/reviews",
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

  const handleSubmitReturn = async (event) => {
  event.preventDefault();

  if (!selectedReturnOrder || !selectedReturnItem) return;

  try {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setReturnLoading(true);
    setReturnError("");
    setReturnMessage("");

   const response = await api.post(
  "/returns",
      {
  orderId: selectedReturnOrder._id,
  requestType: returnType,
  selectionType: "ONE_PRODUCT",
  items: [
  {
    productId: getProductId(selectedReturnItem),
    variantId:
      typeof selectedReturnItem.variantId === "object"
        ? selectedReturnItem.variantId?._id
        : selectedReturnItem.variantId,
    quantity: Number(returnQuantity),
    reason: returnReason,
    description: returnDescription.trim(),
    ...(returnType === "EXCHANGE" && {
      exchangeVariantId,
    }),
  },
],
},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setMyReturnRequests((previous) => [
      ...(response.data.returnRequest ? [response.data.returnRequest] : []),
      ...previous,
    ]);

   setReturnMessage(
  returnType === "EXCHANGE"
    ? "Your exchange request has been submitted successfully."
    : "Your return request has been submitted successfully.",
);

   
  } catch (error) {
    setReturnError(
      error.response?.data?.message ||
        "Unable to submit your request. Please try again.",
    );
  } finally {
    setReturnLoading(false);
  }
};

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isWithinReturnWindow = (order) => {
  if (
    String(order.orderStatus).toUpperCase() !== "DELIVERED" ||
    !order.deliveredAt
  ) {
    return false;
  }

  const deliveredTime = new Date(order.deliveredAt).getTime();

  if (Number.isNaN(deliveredTime)) {
    return false;
  }

  const deadline = deliveredTime + 4 * 24 * 60 * 60 * 1000;

  return Date.now() <= deadline;
};


const getItemReturnRequest = (orderId, item) => {
  const getId = (value) =>
    String(
      value && typeof value === "object"
        ? value._id || ""
        : value || ""
    );

  const productId = getId(item.productId);
  const variantId = getId(item.variantId);

  const matchingRequests = myReturnRequests
    .filter((request) => {
      if (getId(request.orderId) !== getId(orderId)) {
        return false;
      }

      return (request.items || []).some((returnItem) => {
        const sameProduct =
          getId(returnItem.productId) === productId;

        const sameVariant =
          getId(returnItem.variantId) === variantId;

        return sameProduct && sameVariant;
      });
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );

  const request = matchingRequests[0];

  if (!request) return null;

  const matchingItem = request.items.find(
    (returnItem) =>
      getId(returnItem.productId) === productId &&
      getId(returnItem.variantId) === variantId
  );

  return {
    type: String(request.requestType || "RETURN").toUpperCase(),
    status: String(
      matchingItem?.status || request.status || "PENDING"
    ).toUpperCase(),
  };
};


const isReturnOrExchangeCompleted = (orderId, item) => {
  const request = getItemReturnRequest(orderId, item);

  return request?.status === "COMPLETED";
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
  src={getImageUrl(item.productImage)}
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
                          
{(() => {
  const returnRequest = getItemReturnRequest(order._id, item);

  if (!returnRequest) return null;

  const { type, status } = returnRequest;

  const statusLabels = {
    PENDING: `${type} PENDING`,
    APPROVED: `${type} APPROVED`,
    COMPLETED: `${type} COMPLETED`,
    REJECTED: `${type} REJECTED`,
  };

  return (
    <p
      className={`my-order-return-status ${status.toLowerCase()}`}
      role="status"
    >
      {statusLabels[status] || `${type}: ${status.replace(/_/g, " ")}`}
    </p>
  );
})()}

{String(order.orderStatus).toUpperCase() === "DELIVERED" &&
  isWithinReturnWindow(order) &&
  !(
    getItemReturnRequest(order._id, item)?.type === "RETURN" &&
    getItemReturnRequest(order._id, item)?.status === "COMPLETED"
  ) && (
    <button
      type="button"
      className="my-order-return-button"
      onClick={() => handleOpenReturnModal(order, item)}
    >
      RETURN / EXCHANGE
    </button>
  )}

                          

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

          {returnModalOpen && selectedReturnOrder && selectedReturnItem && (
  <div
    className="my-return-overlay"
    onClick={() => {
      if (!returnLoading) {
        setReturnModalOpen(false);
      }
    }}
  >
    <form
      className="my-return-modal"
      onSubmit={handleSubmitReturn}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="my-return-close"
        onClick={() => setReturnModalOpen(false)}
        disabled={returnLoading}
        aria-label="Close return form"
      >
        ×
      </button>

      <p className="my-return-eyebrow">ESSENZA CUSTOMER CARE</p>
      <h2>RETURN / EXCHANGE</h2>

      <p className="my-return-product">
        {selectedReturnItem.productName}
      </p>

      <p className="my-return-info">
        Order #{selectedReturnOrder._id.slice(-8).toUpperCase()}
      </p>

      <label htmlFor="return-type">REQUEST TYPE</label>
    <select
  id="return-type"
  value={returnType}
  onChange={(event) => handleReturnTypeChange(event.target.value)}
  disabled={returnLoading}
>
  <option value="RETURN">Return product</option>
  <option value="EXCHANGE">Exchange product</option>
</select>

{returnType === "EXCHANGE" && (
  <>
    <label htmlFor="exchange-variant">
      SELECT REPLACEMENT SIZE
    </label>

    {exchangeVariantsLoading ? (
      <p>Loading available sizes...</p>
    ) : (
      <select
        id="exchange-variant"
        value={exchangeVariantId}
        onChange={(event) => setExchangeVariantId(event.target.value)}
        required
        disabled={returnLoading || exchangeVariants.length === 0}
      >
        <option value="">Choose a replacement size</option>

        {exchangeVariants.map((variant) => (
          <option key={variant._id} value={variant._id}>
            {variant.size} — ₹{variant.price} ({variant.stock} available)
          </option>
        ))}
      </select>
    )}
  </>
)}

      <label htmlFor="return-quantity">QUANTITY</label>
      <select
        id="return-quantity"
        value={returnQuantity}
        onChange={(event) => setReturnQuantity(Number(event.target.value))}
        disabled={returnLoading}
      >
        {Array.from(
          { length: selectedReturnItem.quantity },
          (_, index) => index + 1,
        ).map((quantity) => (
          <option key={quantity} value={quantity}>
            {quantity}
          </option>
        ))}
      </select>

      <label htmlFor="return-reason">REASON</label>
      <select
        id="return-reason"
        value={returnReason}
        onChange={(event) => setReturnReason(event.target.value)}
        required
        disabled={returnLoading}
      >
        <option value="">Select a reason</option>
        <option value="QUALITY_ISSUE">Quality issue</option>
       <option value="DAMAGED_PRODUCT">Product damaged</option>
<option value="WRONG_PRODUCT">Wrong product received</option>
        <option value="OTHER">Other</option>
      </select>

      <label htmlFor="return-description">
        ADDITIONAL DETAILS (OPTIONAL)
      </label>
      <textarea
        id="return-description"
        value={returnDescription}
        onChange={(event) => setReturnDescription(event.target.value)}
        placeholder="Tell us more about your request..."
        rows={3}
        maxLength={1000}
        disabled={returnLoading}
      />

      {returnError && (
        <p className="my-return-error">{returnError}</p>
      )}

      {returnMessage && (
        <p className="my-return-success">{returnMessage}</p>
      )}

      <button
        type="submit"
        className="my-return-submit"
        disabled={returnLoading}
      >
        {returnLoading ? "SUBMITTING..." : "SUBMIT REQUEST"}
      </button>
    </form>
  </div>
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
