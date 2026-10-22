
const mongoose = require("mongoose");
const Order = require("../models/Order");
const ReturnRequest = require("../models/ReturnRequest");

// ==========================================
// CREATE RETURN REQUEST
// ==========================================

const createReturnRequestService = async ({
  userId,
  orderId,
  productId,
  variantId,
  quantity,
  reason,
  description = "",
}) => {
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(orderId) ||
    !mongoose.isValidObjectId(productId) ||
    !mongoose.isValidObjectId(variantId)
  ) {
    throw new Error("Invalid return request details.");
  }

  const allowedReasons = [
    "DAMAGED_PRODUCT",
    "WRONG_PRODUCT",
    "QUALITY_ISSUE",
    "OTHER",
  ];

  if (!allowedReasons.includes(reason)) {
    throw new Error("Please select a valid return reason.");
  }

  if (
    typeof description !== "string" ||
    description.length > 1000
  ) {
    throw new Error("Description must be 1000 characters or fewer.");
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isSafeInteger(requestedQuantity) ||
    requestedQuantity < 1
  ) {
    throw new Error("Please provide a valid return quantity.");
  }

  const order = await Order.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.orderStatus !== "DELIVERED") {
    throw new Error("Only delivered orders can be returned.");
  }

  if (!order.deliveredAt) {
    throw new Error(
      "Delivery date is unavailable. Please contact support."
    );
  }

  const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
  const returnDeadline =
    new Date(order.deliveredAt).getTime() + FOUR_DAYS_MS;

  if (Date.now() > returnDeadline) {
    throw new Error(
      "The 4-day return window for this order has expired."
    );
  }

  const orderItem = order.items.find(
    (item) =>
      item.productId.toString() === productId &&
      item.variantId.toString() === variantId
  );

  if (!orderItem) {
    throw new Error("Product not found in this order.");
  }

  if (requestedQuantity > orderItem.quantity) {
    throw new Error(
      "Return quantity cannot exceed the purchased quantity."
    );
  }

  const existingRequests = await ReturnRequest.find({
    userId,
    orderId,
    productId,
    variantId,
    status: { $in: ["PENDING", "APPROVED", "COMPLETED"] },
  });

  const alreadyRequestedQuantity = existingRequests.reduce(
    (total, request) => total + request.quantity,
    0
  );

  if (
    alreadyRequestedQuantity + requestedQuantity >
    orderItem.quantity
  ) {
    throw new Error(
      "The requested quantity has already been returned or is awaiting review."
    );
  }

  const returnRequest = await ReturnRequest.create({
    userId,
    orderId,
    productId,
    variantId,
    productName: orderItem.productName,
    size: orderItem.size,
    quantity: requestedQuantity,
    reason,
    description: description.trim(),
  });

  return returnRequest;
};

// ==========================================
// GET MY RETURN REQUESTS
// ==========================================

const getMyReturnRequestsService = async (userId) => {
  return ReturnRequest.find({ userId })
    .populate("orderId", "orderStatus deliveredAt")
    .sort({ createdAt: -1 });
};

module.exports = {
  createReturnRequestService,
  getMyReturnRequestsService,
};
