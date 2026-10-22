
const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Amount actually paid per unit, excluding the original price.
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "DAMAGED_PRODUCT",
        "WRONG_PRODUCT",
        "QUALITY_ISSUE",
        "OTHER",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Exchanges can optionally request a different variant.
    exchangeVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
      ],
      default: "PENDING",
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const returnRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    requestType: {
      type: String,
      enum: ["RETURN", "EXCHANGE"],
      required: true,
      default: "RETURN",
    },

    // ONE_PRODUCT or ALL_PRODUCTS indicates the customer's selection.
    selectionType: {
      type: String,
      enum: ["ONE_PRODUCT", "ALL_PRODUCTS"],
      required: true,
      default: "ONE_PRODUCT",
    },

    items: {
      type: [returnItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one item is required.",
      },
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PARTIALLY_APPROVED",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
      ],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

returnRequestSchema.index({
  userId: 1,
  orderId: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ReturnRequest",
  returnRequestSchema
);
