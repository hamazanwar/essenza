
const express = require("express");
const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
  getSalesReport,
} = require("../controllers/salesReportController");

router.get("/", protectAdmin, getSalesReport);

module.exports = router;
