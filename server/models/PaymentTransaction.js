
const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },

    returnRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnRequest",
      default: null,
      index: true,
    },

    returnItemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    type: {
      type: String,
      enum: [
        "ORDER_PAYMENT",
        "COD_COLLECTION",
        "EXCHANGE_DIFFERENCE",
      ],
      required: true,
    },

    method: {
      type: String,
      enum: ["ONLINE", "COD", "WALLET"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Payment amount must be greater than zero."],
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      required: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ orderId: 1, createdAt: -1 });

module.exports = mongoose.model(
  "PaymentTransaction",
  paymentTransactionSchema
);
