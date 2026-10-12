
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot exceed 5."],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number.",
      },
    },

    comment: {
      type: String,
      required: [true, "Review comment is required."],
      trim: true,
      minlength: [3, "Review must contain at least 3 characters."],
      maxlength: [1000, "Review cannot exceed 1000 characters."],
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews for the same product in the same order.
reviewSchema.index(
  { userId: 1, productId: 1, orderId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);
