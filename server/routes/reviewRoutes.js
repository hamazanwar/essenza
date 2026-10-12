
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
  createReview,
  getProductReviews,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  getAllReviewsAdmin,
  updateReviewVisibility,
  deleteReviewAdmin
} = require("../controllers/reviewController");

router.post("/", protect, createReview);

router.get("/my-reviews", protect, getMyReviews);

router.get("/product/:productId", getProductReviews);

router.patch("/:reviewId", protect, updateMyReview);

router.delete("/:reviewId", protect, deleteMyReview);

// admin side
router.get(
  "/admin",
  protectAdmin,
  getAllReviewsAdmin
);

router.patch(
  "/admin/:reviewId/visibility",
  protectAdmin,
  updateReviewVisibility
);

router.delete(
  "/admin/:reviewId",
  protectAdmin,
  deleteReviewAdmin
);

module.exports = router;
