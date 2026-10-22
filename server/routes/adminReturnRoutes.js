const express = require("express");
const router = express.Router();

const {
  getAllReturnRequests,
  reviewReturnRequest,
  completeReturnAndRefund,
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

module.exports = router;