const express = require("express");
const router = express.Router();

const {
  getAllReturnRequests,
  reviewReturnRequest,
} = require("../controllers/adminReturnController");

// IMPORTANT: Replace these imports with the same admin
// authentication middleware used by your existing admin routes.
const protectAdmin = require("../middleware/adminAuthMiddleware");

router.get("/", protectAdmin, getAllReturnRequests);
router.patch("/:returnRequestId", protectAdmin, reviewReturnRequest);

module.exports = router;