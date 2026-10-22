
const {
  createReturnRequestService,
  getMyReturnRequestsService,
} = require("../services/returnService");

// ==========================================
// CREATE RETURN REQUEST - USER
// ==========================================

const createReturnRequest = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      orderId,
      requestType,
      selectionType,
      items,
    } = req.body;

    const returnRequest = await createReturnRequestService({
      userId,
      orderId,
      requestType,
      selectionType,
      items,
    });

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      returnRequest,
    });
  } catch (error) {
    console.error("Create return request error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to submit return request.",
    });
  }
};

// ==========================================
// GET MY RETURN REQUESTS - USER
// ==========================================

const getMyReturnRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const returnRequests =
      await getMyReturnRequestsService(userId);

    return res.status(200).json({
      success: true,
      returnRequests,
    });
  } catch (error) {
    console.error("Get return requests error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch return requests.",
    });
  }
};

module.exports = {
  createReturnRequest,
  getMyReturnRequests,
};
