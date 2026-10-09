const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  cancelOrder,
  createOnlinePaymentOrder,
  verifyOnlinePayment,
  getOrderDetails
} = require("../controllers/orderController");

router.post("/", protect, createOrder);

router.post("/create-payment-order", protect, createOnlinePaymentOrder);

router.post("/verify-payment", protect, verifyOnlinePayment);

router.get("/my-orders", protect, getMyOrders);

router.get("/:orderId", protect, getOrderDetails);

router.patch("/:orderId/cancel", protect, cancelOrder);

module.exports = router;
