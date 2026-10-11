
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getWalletDetails,
  createWalletTopUpOrder,
  verifyWalletTopUp,
  createWithdrawalRequest
} = require("../controllers/walletController");

router.get("/", protect, getWalletDetails);

router.post(
  "/top-up/create-order",
  protect,
  createWalletTopUpOrder
);

router.post(
  "/top-up/verify",
  protect,
  verifyWalletTopUp
);

router.post(
  "/withdraw",
  protect,
  createWithdrawalRequest
);

module.exports = router;
