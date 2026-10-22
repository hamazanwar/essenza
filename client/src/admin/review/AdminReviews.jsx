import { useEffect, useState } from "react";
import api from "../../services/api";

import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

     const response = await api.get("/reviews/admin", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Fetch admin reviews error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load reviews. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      review.userId?.name?.toLowerCase().includes(searchText) ||
      review.userId?.email?.toLowerCase().includes(searchText) ||
      review.productId?.name?.toLowerCase().includes(searchText) ||
      review.comment?.toLowerCase().includes(searchText);

    const matchesRating =
      ratingFilter === "ALL" || String(review.rating) === ratingFilter;

    return matchesSearch && matchesRating;
  });

  const updateVisibility = async (review) => {
    try {
      setActionLoading(review._id);
      setError("");

      const token = localStorage.getItem("adminToken");

     const response = await api.patch(
  `/reviews/admin/${review._id}/visibility`,
  { isVisible: !review.isVisible },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

      setReviews((previous) =>
        previous.map((item) =>
          item._id === review._id ? { ...item, ...response.data.review } : item,
        ),
      );
    } catch (err) {
      console.error("Update review visibility error:", err);

      setError(
        err.response?.data?.message || "Failed to update review visibility.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const deleteReview = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoading(deleteTarget._id);
      setError("");

      const token = localStorage.getItem("adminToken");
await api.delete(`/reviews/admin/${deleteTarget._id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      setReviews((previous) =>
        previous.filter((review) => review._id !== deleteTarget._id),
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete review error:", err);

      setError(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div>
      <div className="admin-reviews-page">
        <AdminNavbar />

        <main className="admin-reviews-content">
          <div className="admin-reviews-header">
            <div>
              <h1>REVIEW MANAGEMENT</h1>
              <p>Read and manage customer product reviews</p>
            </div>

            <div className="admin-reviews-total">
              <span>TOTAL REVIEWS</span>
              <strong>{reviews.length}</strong>
            </div>
          </div>

          <div className="admin-reviews-filters">
            <input
              type="search"
              placeholder="Search customer, product or review..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option value="ALL">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>

          {error && <p className="admin-reviews-error">{error}</p>}

          {loading ? (
            <p className="admin-reviews-message">Loading reviews...</p>
          ) : filteredReviews.length === 0 ? (
            <div className="admin-reviews-empty">
              <h3>No reviews found</h3>
              <p>Customer reviews matching your search will appear here.</p>
            </div>
          ) : (
            <div className="admin-reviews-list">
              {filteredReviews.map((review) => (
                <article className="admin-review-card" key={review._id}>
                  <div className="admin-review-product">
                    {review.productId?.productImage?.[0] ? (
                      <img
                        src={`${api.defaults.baseURL.replace(/\/api$/, "")}${review.productId.productImage[0]}`}
                        alt={review.productId.name || "Product"}
                      />
                    ) : (
                      <div className="admin-review-image-placeholder">
                        ESSENZA
                      </div>
                    )}

                    <div>
                      <span className="admin-review-label">PRODUCT</span>
                      <h3>{review.productId?.name || "Product unavailable"}</h3>
                      <span className="admin-review-label">CUSTOMER</span>
                      <p>{review.userId?.name || "Unknown customer"}</p>
                      <small>{review.userId?.email || ""}</small>
                    </div>
                  </div>

                  <div className="admin-review-body">
                    <div className="admin-review-meta">
                      <span className="admin-review-stars">
                        {"★".repeat(review.rating || 0)}
                        <span>{"★".repeat(5 - (review.rating || 0))}</span>
                      </span>

                      <span className="admin-review-date">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString()
                          : ""}
                      </span>

                      <span
                        className={
                          review.isVisible
                            ? "admin-review-status visible"
                            : "admin-review-status hidden"
                        }
                      >
                        {review.isVisible ? "VISIBLE" : "HIDDEN"}
                      </span>
                    </div>

                    <p className="admin-review-comment">{review.comment}</p>

                    <div className="admin-review-actions">
                      <button
                        type="button"
                        onClick={() => updateVisibility(review)}
                        disabled={actionLoading === review._id}
                      >
                        {actionLoading === review._id
                          ? "PLEASE WAIT..."
                          : review.isVisible
                            ? "HIDE REVIEW"
                            : "SHOW REVIEW"}
                      </button>

                      <button
                        type="button"
                        className="admin-review-delete-button"
                        onClick={() => setDeleteTarget(review)}
                        disabled={actionLoading === review._id}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {deleteTarget && (
          <div className="admin-review-modal-overlay">
            <div className="admin-review-modal">
              <h2>DELETE REVIEW?</h2>

              <p>
                This will permanently delete the review for{" "}
                <strong>
                  {deleteTarget.productId?.name || "this product"}
                </strong>
                .
              </p>

              <div className="admin-review-modal-actions">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={actionLoading === deleteTarget._id}
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={deleteReview}
                  disabled={actionLoading === deleteTarget._id}
                >
                  {actionLoading === deleteTarget._id
                    ? "DELETING..."
                    : "DELETE REVIEW"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <AdminFooter />
    </div>
  );
}

export default AdminReviews;
