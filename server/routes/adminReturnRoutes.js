const express = require("express");
const router = express.Router();

const {
  getAllReturnRequests,
  reviewReturnRequest,
  completeReturnAndRefund,
  completeExchange,
} = require("../controllers/adminReturnController");

const protectAdmin = require("../middleware/adminAuthMiddleware");

// Get all return requests
router.get("/", protectAdmin, getAllReturnRequests);

// Approve or reject an individual return item
router.patch("/:returnRequestId", protectAdmin, reviewReturnRequest);

// Complete an approved return and credit the wallet
router.patch(
  "/:returnRequestId/complete",
  protectAdmin,
  completeReturnAndRefund
);

// Complete an approved exchange
router.patch(
  "/:returnRequestId/complete-exchange",
  protectAdmin,
  completeExchange
);

module.exports = router;