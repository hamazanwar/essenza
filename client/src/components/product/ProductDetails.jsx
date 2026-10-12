import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [activeOffers, setActiveOffers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewActionMessage, setReviewActionMessage] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const [deleteConfirmReviewId, setDeleteConfirmReviewId] = useState(null);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50,
  });

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:5000/api/products/${productId}`,
        );

        const productData = response.data.product;

        try {
          const offerResponse = await axios.get(
            "http://localhost:5000/api/admin/offers/active",
          );

          setActiveOffers(offerResponse.data.offers || []);
        } catch (offerError) {
          console.error("Get active offers error:", offerError);
          setActiveOffers([]);
        }

        setProduct(productData);

        if (productData.variants?.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (error) {
        console.error("Get product details error:", error);

        if (error.response?.status === 404) {
          setError("This product is no longer available.");
        } else {
          setError(error.response?.data?.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError("");

      const response = await axios.get(
        `http://localhost:5000/api/reviews/product/${productId}`,
      );

      setReviews(response.data.reviews || []);

      const token = localStorage.getItem("token");

      if (token) {
        try {
          const myResponse = await axios.get(
            "http://localhost:5000/api/reviews/my-reviews",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          setMyReviews(myResponse.data.reviews || []);
        } catch (error) {
          console.error("Fetch my reviews error:", error);
          setMyReviews([]);
        }
      } else {
        setMyReviews([]);
      }
    } catch (error) {
      console.error("Fetch product reviews error:", error);
      setReviewsError(
        error.response?.data?.message ||
          "Unable to load reviews. Please try again.",
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setReviewActionMessage("");
    setReviewsError("");
  };

  const handleSaveReview = async (reviewId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setReviewActionLoading(true);
      setReviewsError("");
      setReviewActionMessage("");

      await axios.patch(
        `http://localhost:5000/api/reviews/${reviewId}`,
        {
          rating: editRating,
          comment: editComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEditingReviewId(null);
      setReviewActionMessage("Review updated successfully.");
      await fetchReviews();
    } catch (error) {
      setReviewsError(
        error.response?.data?.message || "Failed to update review.",
      );
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    const reviewId = deleteConfirmReviewId;
    const token = localStorage.getItem("token");

    if (!reviewId) return;

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setReviewActionLoading(true);
      setReviewsError("");
      setReviewActionMessage("");

      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeleteConfirmReviewId(null);
      setEditingReviewId(null);
      setReviewActionMessage("Review deleted successfully.");
      await fetchReviews();
    } catch (error) {
      setReviewsError(
        error.response?.data?.message || "Failed to delete review.",
      );
    } finally {
      setReviewActionLoading(false);
    }
  };

  const applicableOffers = activeOffers.filter((offer) => {
    const productMatches = offer.applicableProducts?.some(
      (item) => String(item._id || item) === String(product._id),
    );

    const categoryMatches = offer.applicableCategories?.some(
      (item) =>
        String(item._id || item) ===
        String(product.categoryId?._id || product.categoryId),
    );

    return productMatches || categoryMatches;
  });

  const bestOffer = selectedVariant
    ? applicableOffers.reduce((best, offer) => {
        const price = selectedVariant.price;

        const discountedPrice =
          offer.discountType === "PERCENTAGE"
            ? price * (1 - offer.discountValue / 100)
            : Math.max(0, price - offer.discountValue);

        if (!best || discountedPrice < best.discountedPrice) {
          return { offer, discountedPrice };
        }

        return best;
      }, null)
    : null;

  const handleImageMouseMove = (event) => {
    const imageContainer = event.currentTarget;

    const rect = imageContainer.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;

    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x,
      y,
    });
  };

  const addToCart = async () => {
    try {
      const token = localStorage.getItem("token");

      setError("");
      setCartMessage("");

      if (!token) {
        setError("Please login to add products to your cart.");
        return;
      }

      if (!selectedVariant) {
        setError("Please select a product variant.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/cart",
        {
          productId: productId,
          variantId: selectedVariant._id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Add to cart response:", response.data);

      setCartMessage("Product added to cart successfully.");
    } catch (error) {
      console.error("Add to cart error:", error);

      setError(
        error.response?.data?.message || "Failed to add product to cart",
      );
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-message">Loading product...</div>
        </main>

        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-message error">{error}</div>
        </main>

        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-message">Product not found.</div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        <div className="product-details-container">
          {/* PRODUCT IMAGE GALLERY */}
          <section className="product-gallery">
            <div
              className={`product-main-image ${
                isImageZoomed ? "image-zoomed" : ""
              }`}
              onMouseEnter={() => {
                setIsImageZoomed(true);
              }}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={() => {
                setIsImageZoomed(false);
                setZoomPosition({
                  x: 50,
                  y: 50,
                });
              }}
            >
              {product.productImage?.length > 0 ? (
                <img
                  src={`http://localhost:5000${product.productImage[selectedImage]}`}
                  alt={product.name}
                  style={{
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              ) : (
                <div className="product-main-image-placeholder">No Image</div>
              )}
            </div>

            {/* THUMBNAILS */}
            {product.productImage?.length > 1 && (
              <div className="product-thumbnails">
                {product.productImage.map((image, index) => (
                  <button
                    key={index}
                    className={`product-thumbnail ${
                      selectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* PRODUCT INFORMATION */}
          <section className="product-details-info">
            <p className="product-details-category">
              {product.categoryId?.name}
            </p>

            <h1>{product.name}</h1>

            <p className="product-details-description">{product.description}</p>

            {selectedVariant && (
              <div className="selected-variant-info">
                {bestOffer ? (
                  <>
                    <p className="product-offer-badge">
                      {bestOffer.offer.discountType === "PERCENTAGE"
                        ? `${bestOffer.offer.discountValue}% OFF`
                        : `₹${bestOffer.offer.discountValue} OFF`}
                    </p>

                    <p className="selected-variant-original-price">
                      ₹{selectedVariant.price}
                    </p>

                    <p className="selected-variant-price">
                      ₹{Math.round(bestOffer.discountedPrice * 100) / 100}
                    </p>

                    <p className="product-offer-name">{bestOffer.offer.name}</p>
                  </>
                ) : (
                  <p className="selected-variant-price">
                    ₹{selectedVariant.price}
                  </p>
                )}

                <p className="selected-variant-stock">
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} available`
                    : "Out of stock"}
                </p>
              </div>
            )}

            {product.variants?.length > 0 ? (
              <div className="product-variants">
                <h3>Size</h3>

                <div className="variant-list">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      className={
                        selectedVariant?._id === variant._id ? "selected" : ""
                      }
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p>No variants available.</p>
            )}
            {selectedVariant && selectedVariant.stock > 0 && (
              <div className="product-quantity">
                <h3>Quantity</h3>

                <div className="quantity-selector">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((previousQuantity) =>
                        Math.max(1, previousQuantity - 1),
                      )
                    }
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((previousQuantity) =>
                        Math.min(selectedVariant.stock, previousQuantity + 1),
                      )
                    }
                    disabled={quantity >= selectedVariant.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            {cartMessage && (
              <p className="cart-success-message">{cartMessage}</p>
            )}
            {selectedVariant && selectedVariant.stock > 0 && (
              <div className="product-action-buttons">
                <button
                  type="button"
                  className="add-to-cart-button"
                  onClick={addToCart}
                >
                  ADD TO CART
                </button>

                <button
                  type="button"
                  className="buy-now-button"
                  onClick={() => {
                    const token = localStorage.getItem("token");

                    if (!token) {
                      navigate("/login");
                      return;
                    }

                    if (!selectedVariant) {
                      setError("Please select a product variant.");
                      return;
                    }

                    navigate("/checkout", {
                      state: {
                        productId: productId,
                        variantId: selectedVariant._id,
                        quantity: quantity,
                      },
                    });
                  }}
                >
                  BUY NOW
                </button>
              </div>
            )}
            {product.fragranceNotes && (
              <div className="product-info-section">
                <h3>FRAGRANCE NOTES</h3>
                <p>{product.fragranceNotes}</p>
              </div>
            )}

            {product.ingredients && (
              <div className="product-info-section">
                <h3>INGREDIENTS</h3>
                <p>{product.ingredients}</p>
              </div>
            )}

            {product.howToUse && (
              <div className="product-info-section">
                <h3>HOW TO USE</h3>
                <p>{product.howToUse}</p>
              </div>
            )}

            {product.shippingAndReturns && (
              <div className="product-info-section">
                <h3>SHIPPING & RETURNS</h3>
                <p>{product.shippingAndReturns}</p>
              </div>
            )}

            <div className="product-reviews-section">
              <div className="product-reviews-heading">
                <div>
                  <h2>CUSTOMER REVIEWS</h2>
                  <p>Discover what customers think about this fragrance.</p>
                </div>

                <button
                  type="button"
                  className="product-see-reviews-button"
                  onClick={() => {
                    const nextState = !showReviews;
                    setShowReviews(nextState);

                    if (nextState) {
                      fetchReviews();
                    }
                  }}
                >
                  {showReviews ? "HIDE REVIEWS" : "SEE REVIEWS"}
                </button>
              </div>

              {showReviews && (
                <div className="product-reviews-list">
                  {reviewsLoading && <p>Loading reviews...</p>}

                  {reviewsError && (
                    <p className="product-reviews-error">{reviewsError}</p>
                  )}

                  {reviewActionMessage && (
                    <p className="product-reviews-success">
                      {reviewActionMessage}
                    </p>
                  )}

                  {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                    <p className="product-no-reviews">
                      No reviews yet. Be the first to share your experience
                      after purchasing this fragrance.
                    </p>
                  )}

                  {reviews.map((review) => {
                    const isOwner = myReviews.some(
                      (myReview) => String(myReview._id) === String(review._id),
                    );

                    return (
                      <article className="product-review-card" key={review._id}>
                        <div className="product-review-top">
                          <strong>
                            {review.userId?.name || "ESSENZA Customer"}
                          </strong>

                          <span>
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>

                        {editingReviewId === review._id ? (
                          <div className="product-review-edit-form">
                            <label>Your rating</label>

                            <div className="product-review-edit-stars">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  className={star <= editRating ? "active" : ""}
                                  onClick={() => setEditRating(star)}
                                  disabled={reviewActionLoading}
                                  aria-label={`${star} stars`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>

                            <label htmlFor={`edit-review-${review._id}`}>
                              Your review
                            </label>

                            <textarea
                              id={`edit-review-${review._id}`}
                              value={editComment}
                              onChange={(event) =>
                                setEditComment(event.target.value)
                              }
                              minLength={3}
                              maxLength={1000}
                              required
                              disabled={reviewActionLoading}
                            />

                            <div className="product-review-actions">
                              <button
                                type="button"
                                onClick={() => setEditingReviewId(null)}
                                disabled={reviewActionLoading}
                              >
                                CANCEL
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSaveReview(review._id)}
                                disabled={
                                  reviewActionLoading ||
                                  editComment.trim().length < 3
                                }
                              >
                                {reviewActionLoading
                                  ? "SAVING..."
                                  : "SAVE REVIEW"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className="product-review-rating"
                              aria-label={`${review.rating} out of 5 stars`}
                            >
                              {"★".repeat(review.rating)}
                              <span>{"★".repeat(5 - review.rating)}</span>
                            </div>

                            <p className="product-review-comment">
                              {review.comment}
                            </p>

                            {isOwner && (
                              <div className="product-review-actions">
                                <button
                                  type="button"
                                  onClick={() => handleEditReview(review)}
                                >
                                  EDIT REVIEW
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirmReviewId(review._id)
                                  }
                                >
                                  DELETE REVIEW
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              {deleteConfirmReviewId && (
                <div className="product-review-delete-overlay">
                  <div
                    className="product-review-delete-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-review-title"
                  >
                    <h3 id="delete-review-title">DELETE REVIEW?</h3>

                    <p>Are you sure you want to delete your review?</p>

                    <div className="product-review-actions">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmReviewId(null)}
                        disabled={reviewActionLoading}
                      >
                        CANCEL
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteReview}
                        disabled={reviewActionLoading}
                      >
                        {reviewActionLoading ? "DELETING..." : "DELETE"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;
