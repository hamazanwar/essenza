
const {
  createReviewService,
  getProductReviewsService,
  getMyReviewsService,
} = require("../services/reviewService");

const createReview = async (req, res) => {
  try {
    const review = await createReviewService({
      userId: req.user._id,
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
    const reviews = await getMyReviewsService(req.user._id);

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

module.exports = {
  createReview,
  getProductReviews,
  getMyReviews,
};
