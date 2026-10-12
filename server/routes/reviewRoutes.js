
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createReview,
  getProductReviews,
  getMyReviews,
} = require("../controllers/reviewController");

// Customer routes
router.post("/", protect, createReview);
router.get("/my-reviews", protect, getMyReviews);

// Public route for displaying reviews on product details
router.get("/product/:productId", getProductReviews);

module.exports = router;
