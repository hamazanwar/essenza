
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createReview,
  getProductReviews,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
} = require("../controllers/reviewController");

router.post("/", protect, createReview);

router.get("/my-reviews", protect, getMyReviews);

router.get("/product/:productId", getProductReviews);

router.patch("/:reviewId", protect, updateMyReview);

router.delete("/:reviewId", protect, deleteMyReview);

module.exports = router;
