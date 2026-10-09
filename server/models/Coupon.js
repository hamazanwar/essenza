
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required."],
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: [true, "Discount type is required."],
    },

    discountValue: {
      type: Number,
      required: [true, "Discount value is required."],
      min: [0.01, "Discount value must be greater than zero."],
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative."],
    },

    maxDiscount: {
      type: Number,
      default: null,
      min: [0, "Maximum discount cannot be negative."],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required."],
    },

    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required."],
    },

    usageLimit: {
      type: Number,
      default: null,
      min: [1, "Usage limit must be at least 1."],
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.pre("validate", function () {
  if (
    this.discountType === "PERCENTAGE" &&
    this.discountValue > 100
  ) {
    this.invalidate(
      "discountValue",
      "Percentage discount cannot exceed 100%."
    );
  }

  if (
    this.startDate &&
    this.expiryDate &&
    this.expiryDate <= this.startDate
  ) {
    this.invalidate(
      "expiryDate",
      "Expiry date must be after the start date."
    );
  }
});

module.exports = mongoose.model("Coupon", couponSchema);
