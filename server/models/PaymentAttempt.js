
const mongoose = require("mongoose");

const paymentAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ORDER = normal product checkout
    // WALLET_TOPUP = adding money to the wallet
    purpose: {
      type: String,
      enum: ["ORDER", "WALLET_TOPUP"],
      default: "ORDER",
      required: true,
    },

    // Required only for product orders
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: function () {
        return this.purpose === "ORDER";
      },
    },

    // Required only for product orders
    items: {
      type: [
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
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          
originalPrice: {
  type: Number,
  required: true,
  min: 0,
},
unitPrice: {
  type: Number,
  required: true,
  min: 0,
},
discountAmount: {
  type: Number,
  required: true,
  min: 0,
  default: 0,
},
offerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Offer",
  default: null,
},

        },
      ],
      required: function () {
        return this.purpose === "ORDER";
      },
      validate: {
        validator: function (items) {
          return (
            this.purpose !== "ORDER" ||
            (Array.isArray(items) && items.length > 0)
          );
        },
        message: "Product orders must contain at least one item.",
      },
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["CREATED", "PROCESSING", "PAID", "FAILED"],
      default: "CREATED",
      required: true,
    },

    paymentId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PaymentAttempt",
  paymentAttemptSchema
);
