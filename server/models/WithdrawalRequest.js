
const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, "Withdrawal amount must be at least ₹1."],
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
      ],
      default: "PENDING",
      required: true,
    },

    referenceId: {
      type: String,
      unique: true,
      sparse: true,
    },

    payoutId: {
      type: String,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },

    failureReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

withdrawalRequestSchema.index({ userId: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema
);
