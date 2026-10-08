const {
  getAllOrdersService,
  updateOrderStatusService,
} = require("../services/adminOrderService");

// ==========================================
// GET ALL ORDERS - ADMIN
// ==========================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersService();

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Get all orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch orders.",
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS - ADMIN
// ==========================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await updateOrderStatusService(
      orderId,
      orderStatus
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update order status.",
    });
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
};