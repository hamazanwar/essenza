const express = require("express");
const router = express.Router();

const {
  createReturnRequest,
  getMyReturnRequests,
} = require("../controllers/returnController");

// Use the same authentication middleware as your other user routes.
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createReturnRequest);
router.get("/my", protect, getMyReturnRequests);

module.exports = router;