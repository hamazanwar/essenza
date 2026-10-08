const express = require("express");

const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
    getAllOrders,
    updateOrderStatus
} = require("../controllers/adminOrderController");

// Get all orders
router.get("/", protectAdmin, getAllOrders);

// Update order status
router.patch("/:orderId/status", protectAdmin, updateOrderStatus);

module.exports = router;