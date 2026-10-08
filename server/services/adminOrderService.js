const Order = require("../models/Order");

// ==========================================
// GET ALL ORDERS - ADMIN
// ==========================================

const getAllOrdersService = async () => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .populate("addressId")
    .sort({ createdAt: -1 });

  return orders;
};

// ==========================================
// UPDATE ORDER STATUS - ADMIN
// ==========================================

const updateOrderStatusService = async (orderId, orderStatus) => {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!validStatuses.includes(orderStatus)) {
    throw new Error("Invalid order status.");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found.");
  }

  // Prevent changing a cancelled order
  if (order.orderStatus === "CANCELLED") {
    throw new Error("Cancelled orders cannot be updated.");
  }

  // Prevent changing a delivered order
  if (order.orderStatus === "DELIVERED") {
    throw new Error("Delivered orders cannot be updated.");
  }

  // ==========================================
  // CANCEL ORDER
  // ==========================================

  if (orderStatus === "CANCELLED") {
    for (const item of order.items) {
      await require("../models/variant").findByIdAndUpdate(
        item.variantId,
        {
          $inc: { stock: item.quantity },
        }
      );
    }

    order.orderStatus = "CANCELLED";
    order.cancelledAt = new Date();

    await order.save();

    return order;
  }

  // ==========================================
  // UPDATE NORMAL STATUS
  // ==========================================

  order.orderStatus = orderStatus;

  // Set delivered date when order is delivered
  if (orderStatus === "DELIVERED") {
    order.deliveredAt = new Date();
  }

  await order.save();

  return order;
};

module.exports = {
  getAllOrdersService,
  updateOrderStatusService,
};