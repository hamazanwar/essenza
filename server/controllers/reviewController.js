
const {
  createReviewService,
  getProductReviewsService,
  getMyReviewsService,
  updateMyReviewService,
  deleteMyReviewService,
  getAllReviewsAdminService,
  updateReviewVisibilityService,
  deleteReviewAdminService
} = require("../services/reviewService");

const createReview = async (req, res) => {
  try {
    console.log("Review auth user:", req.user);
    const review = await createReviewService({
      userId: req.user.userId,
      productId: req.body.productId,
      orderId: req.body.orderId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    const statusCode =
      error.code === 11000 ||
      error.message.includes("already reviewed")
        ? 409
        : error.message === "Product not found."
          ? 404
          : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to submit review.",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await getProductReviewsService(
      req.params.productId
    );

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    return res.status(
      error.message === "Product not found." ? 404 : 400
    ).json({
      success: false,
      message: error.message || "Failed to fetch product reviews.",
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await getMyReviewsService(req.user.userId);

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your reviews.",
    });
  }
};


const updateMyReview = async (req, res) => {
  try {
    const review = await updateMyReviewService({
      userId: req.user.userId,
      reviewId: req.params.reviewId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (error) {
    const statusCode =
      error.message.includes("not found") ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update review.",
    });
  }
};

const deleteMyReview = async (req, res) => {
  try {
    await deleteMyReviewService({
      userId: req.user.userId,
      reviewId: req.params.reviewId,
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    const statusCode =
      error.message.includes("not found") ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete review.",
    });
  }
};


const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await getAllReviewsAdminService();

    console.log(
      "Admin reviews product data:",
      reviews.map((review) => ({
        reviewId: review._id,
        productId: review.productId?._id || review.productId,
        productName: review.productId?.name,
        productImage: review.productId?.productImage,
      })),
    );

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get admin reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
    });
  }
};

const updateReviewVisibility = async (req, res) => {
  try {
    const { isVisible } = req.body;

    const review = await updateReviewVisibilityService(
      req.params.reviewId,
      isVisible
    );

    return res.status(200).json({
      success: true,
      message: "Review visibility updated successfully.",
      review,
    });
  } catch (error) {
    const statusCode =
      error.message === "Review not found." ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update review visibility.",
    });
  }
};

const deleteReviewAdmin = async (req, res) => {
  try {
    await deleteReviewAdminService(req.params.reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    const statusCode =
      error.message === "Review not found." ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete review.",
    });
  }
};



module.exports = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateMyReview,
  deleteMyReview,
  getAllReviewsAdmin,
  updateReviewVisibility,
  deleteReviewAdmin
};
