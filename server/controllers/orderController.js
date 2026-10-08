const {
  createOrderService,
  getMyOrdersService,
  cancelOrderService
} = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      addressId,
      items,
      paymentMethod,
    } = req.body;

    const order = await createOrderService({
      userId,
      addressId,
      items,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create order.",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await getMyOrdersService(userId);

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await cancelOrderService(
      userId,
      orderId
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message || "Failed to cancel order.",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  cancelOrder
};