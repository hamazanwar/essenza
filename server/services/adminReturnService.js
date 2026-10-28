
const mongoose = require("mongoose");
const ReturnRequest = require("../models/ReturnRequest");
const Wallet = require("../models/Wallet");
const { applyWalletTransactionService } = require("./walletService");

// ==========================================
// GET ALL RETURN AND EXCHANGE REQUESTS
// ==========================================

const getAllReturnRequestsService = async () => {
  return await ReturnRequest.find()
    .populate("userId", "name email")
    .populate({
      path: "orderId",
      select: "orderStatus deliveredAt userId",
      populate: {
        path: "userId",
        select: "name email",
      },
    })
    .populate("items.productId", "name productImage")
    .populate("items.variantId", "size price stock")
    .populate("items.exchangeVariantId", "size price stock")
    .sort({ createdAt: -1 });
};

// ==========================================
// UPDATE OVERALL REQUEST STATUS
// ==========================================

const updateOverallStatus = (returnRequest) => {
  const statuses = returnRequest.items.map((item) => item.status);

  if (statuses.every((status) => status === "REJECTED")) {
    returnRequest.status = "REJECTED";
    return;
  }

  if (statuses.every((status) => status === "COMPLETED")) {
    returnRequest.status = "COMPLETED";
    return;
  }

  if (statuses.every((status) => status === "APPROVED" || status === "COMPLETED")) {
    returnRequest.status = "APPROVED";
    return;
  }

  if (statuses.some((status) => status === "APPROVED" || status === "COMPLETED")) {
    returnRequest.status = "PARTIALLY_APPROVED";
    return;
  }

  if (statuses.every((status) => status === "PENDING")) {
    returnRequest.status = "PENDING";
    return;
  }

  if (statuses.some((status) => status === "PENDING")) {
    returnRequest.status = "PENDING";
  }
};

// ==========================================
// APPROVE OR REJECT AN INDIVIDUAL ITEM
// ==========================================

const reviewReturnRequestService = async ({
  returnRequestId,
  itemId,
  decision,
  adminNote = "",
}) => {
  if (!mongoose.Types.ObjectId.isValid(returnRequestId)) {
    const error = new Error("Invalid return request ID.");
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const error = new Error("Invalid return item ID.");
    error.statusCode = 400;
    throw error;
  }

  if (!["APPROVED", "REJECTED"].includes(decision)) {
    const error = new Error("Decision must be APPROVED or REJECTED.");
    error.statusCode = 400;
    throw error;
  }

  const returnRequest = await ReturnRequest.findById(returnRequestId);

  if (!returnRequest) {
    const error = new Error("Return request not found.");
    error.statusCode = 404;
    throw error;
  }

  const item = returnRequest.items.id(itemId);

  if (!item) {
    const error = new Error("Item not found in this return request.");
    error.statusCode = 404;
    throw error;
  }

  if (item.status !== "PENDING") {
    const error = new Error(
      `This item has already been reviewed. Current status: ${item.status}.`
    );
    error.statusCode = 409;
    throw error;
  }

  item.status = decision;
  item.adminNote = adminNote.trim();
  item.reviewedAt = new Date();

  updateOverallStatus(returnRequest);

  await returnRequest.save();

  return returnRequest;
};


const completeReturnAndRefundService = async ({
  returnRequestId,
  itemId,
  adminId,
}) => {
  const mongoose = require("mongoose");

  if (
    !mongoose.isValidObjectId(returnRequestId) ||
    !mongoose.isValidObjectId(itemId)
  ) {
    const error = new Error("Invalid return request or item ID.");
    error.statusCode = 400;
    throw error;
  }

  const returnRequest = await ReturnRequest.findById(returnRequestId);

  if (!returnRequest) {
    const error = new Error("Return request not found.");
    error.statusCode = 404;
    throw error;
  }

  const item = returnRequest.items.id(itemId);

  if (!item) {
    const error = new Error("Return item not found.");
    error.statusCode = 404;
    throw error;
  }

  if (returnRequest.requestType !== "RETURN") {
    const error = new Error(
      "Wallet refunds are only available for return requests, not exchanges."
    );
    error.statusCode = 400;
    throw error;
  }

  if (item.status !== "APPROVED") {
    const error = new Error(
      "Only approved return items can be completed and refunded."
    );
    error.statusCode = 400;
    throw error;
  }

  if (item.status === "COMPLETED" || item.refundAmount > 0) {
  const error = new Error("This return item has already been completed or refunded.");
  error.statusCode = 409;
  throw error;
}

  const refundAmount =
    Math.round(item.unitPrice * item.quantity * 100) / 100;

  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    const error = new Error("Invalid refund amount.");
    error.statusCode = 400;
    throw error;
  }

  const wallet = await Wallet.findOne({ userId: returnRequest.userId });

  if (!wallet) {
    const error = new Error("Customer wallet not found.");
    error.statusCode = 404;
    throw error;
  }

  const transactionResult = await applyWalletTransactionService({
    userId: returnRequest.userId,
    type: "CREDIT",
    source: "REFUND",
    amount: refundAmount,
    referenceId: `return_refund_${returnRequest._id}_${item._id}`,
    orderId: returnRequest.orderId,
    description: `Refund for ${item.productName}, quantity ${item.quantity}`,
    performedBy: adminId || null,
  });

  // A repeated call with the same reference must not credit the wallet twice.
  // If the transaction already exists, still finish recording the item status.
  item.refundAmount = refundAmount;
  item.status = "COMPLETED";
  item.completedAt = new Date();

  const statuses = returnRequest.items.map((returnItem) => returnItem.status);

  if (statuses.every((status) => status === "REJECTED")) {
    returnRequest.status = "REJECTED";
  } else if (statuses.every((status) => status === "COMPLETED")) {
    returnRequest.status = "COMPLETED";
  } else if (
    statuses.every((status) =>
      ["APPROVED", "COMPLETED"].includes(status)
    )
  ) {
    returnRequest.status = "APPROVED";
  } else {
    returnRequest.status = "PARTIALLY_APPROVED";
  }

  await returnRequest.save();

  return {
    returnRequest,
    refundAmount,
    duplicateTransaction: transactionResult.duplicate,
  };
};


module.exports = {
  getAllReturnRequestsService,
  reviewReturnRequestService,
  completeReturnAndRefundService
};
