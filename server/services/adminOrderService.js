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


const updateOrderStatusService = async (
  orderId,
  orderStatus,
  deliveryDate
) => {
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

  if (order.orderStatus === "CANCELLED") {
    throw new Error("Cancelled orders cannot be updated.");
  }

  if (order.orderStatus === "DELIVERED") {
    throw new Error("Delivered orders cannot be updated.");
  }

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

  
order.orderStatus = orderStatus;

if (orderStatus === "DELIVERED") {
  const parsedDeliveryDate = deliveryDate
    ? new Date(deliveryDate)
    : new Date();

  if (Number.isNaN(parsedDeliveryDate.getTime())) {
    throw new Error("Invalid delivery date.");
  }

  order.deliveredAt = parsedDeliveryDate;
}

// Older orders may not contain originalPrice.
// Backfill it from the saved item price before validation.
for (const item of order.items) {
  if (item.originalPrice == null) {
    item.originalPrice = item.price;
  }
}

await order.save();

return order;

};

module.exports = {
  getAllOrdersService,
  updateOrderStatusService,
};