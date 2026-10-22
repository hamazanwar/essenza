
const mongoose = require("mongoose");
const Order = require("../models/Order");
const ReturnRequest = require("../models/ReturnRequest");
const Variant = require("../models/variant");

// ==========================================
// CREATE RETURN / EXCHANGE REQUEST
// ==========================================

const createReturnRequestService = async ({
  userId,
  orderId,
  requestType = "RETURN",
  selectionType = "ONE_PRODUCT",
  items,
}) => {
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(orderId)
  ) {
    throw new Error("Invalid order or user.");
  }

  if (!["RETURN", "EXCHANGE"].includes(requestType)) {
    throw new Error("Invalid request type.");
  }

  if (!["ONE_PRODUCT", "ALL_PRODUCTS"].includes(selectionType)) {
    throw new Error("Invalid selection type.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Select at least one product.");
  }

  if (selectionType === "ONE_PRODUCT" && items.length !== 1) {
    throw new Error("Select exactly one product.");
  }

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.orderStatus !== "DELIVERED") {
    throw new Error("Only delivered orders can be returned or exchanged.");
  }

  if (!order.deliveredAt) {
    throw new Error("Delivery date is unavailable. Please contact support.");
  }

  const deadline =
    new Date(order.deliveredAt).getTime() + 4 * 24 * 60 * 60 * 1000;

  if (Date.now() > deadline) {
    throw new Error("The 4-day return window has expired.");
  }

  const allowedReasons = [
    "DAMAGED_PRODUCT",
    "WRONG_PRODUCT",
    "QUALITY_ISSUE",
    "OTHER",
  ];

  const normalizedItems = [];
  const seenItems = new Set();

  for (const requested of items) {
    const { productId, variantId, quantity, reason, description = "", exchangeVariantId = null } =
      requested;

    if (
      !mongoose.isValidObjectId(productId) ||
      !mongoose.isValidObjectId(variantId)
    ) {
      throw new Error("Invalid product selection.");
    }

    const key = `${productId}:${variantId}`;

    if (seenItems.has(key)) {
      throw new Error("The same product variant was selected more than once.");
    }

    seenItems.add(key);

    const qty = Number(quantity);

    if (!Number.isSafeInteger(qty) || qty < 1) {
      throw new Error("Return quantity must be a positive whole number.");
    }

    if (!allowedReasons.includes(reason)) {
      throw new Error("Select a valid return reason.");
    }

    if (
      typeof description !== "string" ||
      description.length > 1000
    ) {
      throw new Error("Description must be 1000 characters or fewer.");
    }

    const orderItem = order.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (!orderItem) {
      throw new Error("A selected product was not found in this order.");
    }

    
const existingRequests = await ReturnRequest.find({
  userId,
  orderId,
  items: {
    $elemMatch: {
      productId,
      variantId,
      status: { $ne: "REJECTED" },
    },
  },
});


    let alreadyRequested = 0;

    for (const existing of existingRequests) {
      for (const existingItem of existing.items) {
        if (
          existingItem.productId.toString() === productId &&
          existingItem.variantId.toString() === variantId &&
          existingItem.status !== "REJECTED"
        ) {
          alreadyRequested += existingItem.quantity;
        }
      }
    }

    if (alreadyRequested + qty > orderItem.quantity) {
      throw new Error(
        `The requested quantity for ${orderItem.productName} exceeds the quantity available for return.`
      );
    }

    let exchangeVariant = null;

   if (requestType === "EXCHANGE") {
  if (!exchangeVariantId || !mongoose.isValidObjectId(exchangeVariantId)) {
    throw new Error("Select a replacement variant for the exchange.");
  }

  exchangeVariant = await Variant.findOne({
    _id: exchangeVariantId,
    productId,
    stock: { $gt: 0 },
  });

  if (!exchangeVariant) {
    throw new Error("The selected replacement variant is unavailable.");
  }

  // Same-variant exchanges are allowed.
  // Different sizes are also allowed when in stock.
}

    normalizedItems.push({
      productId: orderItem.productId,
      variantId: orderItem.variantId,
      productName: orderItem.productName,
      size: orderItem.size,
      quantity: qty,
      unitPrice: orderItem.price,
      reason,
      description: description.trim(),
      exchangeVariantId: exchangeVariant?._id || null,
      status: "PENDING",
      refundAmount: 0,
    });
  }

  // ALL_PRODUCTS means all eligible purchased variants must be included.
  if (selectionType === "ALL_PRODUCTS") {
    for (const orderItem of order.items) {
      const selected = normalizedItems.find(
        (item) =>
          item.productId.toString() === orderItem.productId.toString() &&
          item.variantId.toString() === orderItem.variantId.toString()
      );

      if (!selected || selected.quantity !== orderItem.quantity) {
        throw new Error(
          "To return all products, include every order item and its full purchased quantity."
        );
      }
    }

    if (normalizedItems.length !== order.items.length) {
      throw new Error(
        "To return all products, include every item from the order."
      );
    }
  }

  return ReturnRequest.create({
    userId,
    orderId,
    requestType,
    selectionType,
    items: normalizedItems,
    status: "PENDING",
  });
};

// ==========================================
// GET USER RETURN / EXCHANGE REQUESTS
// ==========================================

const getMyReturnRequestsService = async (userId) => {
  return ReturnRequest.find({ userId })
    .populate("orderId", "orderStatus deliveredAt")
    .populate("items.productId", "name productImage")
    .populate("items.exchangeVariantId", "size price stock")
    .sort({ createdAt: -1 });
};

module.exports = {
  createReturnRequestService,
  getMyReturnRequestsService,
};
