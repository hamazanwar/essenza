
const {
  getAllReturnRequestsService,
  reviewReturnRequestService,
} = require("../services/adminReturnService");

// GET ALL RETURN REQUESTS
const getAllReturnRequests = async (req, res) => {
  try {
    const returnRequests = await getAllReturnRequestsService();

    return res.status(200).json({
      success: true,
      returnRequests,
    });
  } catch (error) {
    console.error("Get return requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch return requests.",
    });
  }
};

// APPROVE OR REJECT A RETURN REQUEST
const reviewReturnRequest = async (req, res) => {
  try {
    const { returnRequestId } = req.params;
    const { status, adminNote } = req.body;

    const returnRequest = await reviewReturnRequestService({
      returnRequestId,
      status,
      adminNote,
    });

    return res.status(200).json({
      success: true,
      message: `Return request ${status.toLowerCase()} successfully.`,
      returnRequest,
    });
  } catch (error) {
    console.error("Review return request error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to review return request.",
    });
  }
};

module.exports = {
  getAllReturnRequests,
  reviewReturnRequest,
};
