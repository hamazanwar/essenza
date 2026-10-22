
const {
  getAllReturnRequestsService,
  reviewReturnRequestService,
  completeReturnAndRefundService
} = require("../services/adminReturnService");

// ==========================================
// GET ALL RETURN REQUESTS - ADMIN
// ==========================================

const getAllReturnRequests = async (req, res) => {
  try {
    const returnRequests = await getAllReturnRequestsService();

    return res.status(200).json({
      success: true,
      count: returnRequests.length,
      returnRequests,
    });
  } catch (error) {
    console.error("Get all return requests error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch return requests.",
    });
  }
};

// ==========================================
// REVIEW RETURN ITEM - ADMIN
// ==========================================

const reviewReturnRequest = async (req, res) => {
  try {
    const { returnRequestId } = req.params;
    const { itemId, decision, adminNote } = req.body;

    const returnRequest = await reviewReturnRequestService({
      returnRequestId,
      itemId,
      decision,
      adminNote,
    });

    return res.status(200).json({
      success: true,
      message: `Return item ${decision.toLowerCase()} successfully.`,
      returnRequest,
    });
  } catch (error) {
    console.error("Review return request error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to review return request.",
    });
  }
};

const completeReturnAndRefund = async (req, res) => {
  try {
    const { returnRequestId } = req.params;
    const { itemId } = req.body;

    const adminId = req.user?.userId || null;

    const result = await completeReturnAndRefundService({
      returnRequestId,
      itemId,
      adminId,
    });

    return res.status(200).json({
      success: true,
      message: `Refund of ₹${result.refundAmount} credited to the customer's wallet.`,
      refundAmount: result.refundAmount,
      duplicateTransaction: result.duplicateTransaction,
      returnRequest: result.returnRequest,
    });
  } catch (error) {
    console.error("Complete return and refund error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to complete return and refund.",
    });
  }
};

module.exports = {
  getAllReturnRequests,
  reviewReturnRequest,
  completeReturnAndRefund
};
