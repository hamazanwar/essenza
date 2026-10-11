
const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    source: {
      type: String,
      enum: [
        "ADD_MONEY",
        "ORDER_PAYMENT",
        "REFUND",
        "ADMIN_CREDIT",
        "ADMIN_DEBIT",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Transaction amount must be greater than zero."],
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    paymentId: {
      type: String,
      default: null,
    },

    
    referenceId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },


    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS",
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);
