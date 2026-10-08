const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createOrder,
  getMyOrders,
  cancelOrder
} = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.patch("/:orderId/cancel", protect, cancelOrder);

module.exports = router;