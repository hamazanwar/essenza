
const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/product");

const createReviewService = async ({
  userId,
  productId,
  orderId,
  rating,
  comment,
}) => {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  if (!productId || !orderId) {
    throw new Error("Product and order are required.");
  }

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new Error("Rating must be between 1 and 5.");
  }

  if (
    typeof comment !== "string" ||
    comment.trim().length < 3 ||
    comment.trim().length > 1000
  ) {
    throw new Error("Review must contain between 3 and 1000 characters.");
  }

  // Verify that the order belongs to this user and is completed.
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: "DELIVERED",
  });

  if (!order) {
    throw new Error("You can review products only from delivered orders.");
  }

  // Verify that this product was included in the order.
  const purchasedItem = order.items.find(
    (item) => String(item.productId) === String(productId)
  );

  if (!purchasedItem) {
    throw new Error("This product was not found in the selected order.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  try {
    return await Review.create({
      userId,
      productId,
      orderId,
      rating: numericRating,
      comment: comment.trim(),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("You have already reviewed this product for this order.");
    }

    throw error;
  }
};

const getProductReviewsService = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  return Review.find({
    productId,
    isVisible: true,
  })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean();
};

const getMyReviewsService = async (userId) => {
  return Review.find({ userId })
    .populate("productId", "name productImage")
    .populate("orderId", "createdAt")
    .sort({ createdAt: -1 })
    .lean();
};


const updateMyReviewService = async ({
  userId,
  reviewId,
  rating,
  comment,
}) => {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new Error("Rating must be between 1 and 5.");
  }

  if (
    typeof comment !== "string" ||
    comment.trim().length < 3 ||
    comment.trim().length > 1000
  ) {
    throw new Error(
      "Review must contain between 3 and 1000 characters."
    );
  }

  const review = await Review.findOne({
    _id: reviewId,
    userId,
  });

  if (!review) {
    throw new Error("Review not found or you cannot edit it.");
  }

  review.rating = numericRating;
  review.comment = comment.trim();

  await review.save();

  return review;
};

const deleteMyReviewService = async ({ userId, reviewId }) => {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  const review = await Review.findOneAndDelete({
    _id: reviewId,
    userId,
  });

  if (!review) {
    throw new Error("Review not found or you cannot delete it.");
  }

  return review;
};


module.exports = {
  createReviewService,
  getProductReviewsService,
  getMyReviewsService,
  updateMyReviewService,
  deleteMyReviewService
};
