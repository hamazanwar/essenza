
const ReturnRequest = require("../models/ReturnRequest");

// ==========================================
// GET ALL RETURN REQUESTS - ADMIN
// ==========================================

const getAllReturnRequestsService = async () => {
  return ReturnRequest.find()
    .populate("userId", "name email")
    .populate("orderId", "totalAmount orderStatus deliveredAt")
    .populate("productId", "name productImage")
    .sort({ createdAt: -1 });
};

// ==========================================
// REVIEW RETURN REQUEST - ADMIN
// ==========================================

const reviewReturnRequestService = async ({
  returnRequestId,
  status,
  adminNote = "",
}) => {
  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Status must be APPROVED or REJECTED.");
  }

  if (typeof adminNote !== "string" || adminNote.length > 1000) {
    throw new Error("Admin note must be 1000 characters or fewer.");
  }

  const returnRequest = await ReturnRequest.findById(returnRequestId);

  if (!returnRequest) {
    throw new Error("Return request not found.");
  }

  if (returnRequest.status !== "PENDING") {
    throw new Error("This return request has already been reviewed.");
  }

  returnRequest.status = status;
  returnRequest.adminNote = adminNote.trim();
  returnRequest.reviewedAt = new Date();

  await returnRequest.save();

  return returnRequest;
};

module.exports = {
  getAllReturnRequestsService,
  reviewReturnRequestService,
};
