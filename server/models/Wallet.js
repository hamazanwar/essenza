
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative."],
      required: true,
    },

    reservedBalance: {
  type: Number,
  default: 0,
  min: [0, "Reserved balance cannot be negative."],
  required: true,
},

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
