const express = require("express");

const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
    getAllCustomers,
    updateCustomerStatus,
    getCustomerDetails
} = require("../controllers/customerController");


// Get all customers
router.get("/", protectAdmin, getAllCustomers);

// Get customer details
router.get("/:id", protectAdmin, getCustomerDetails);

router.patch("/:id/status", protectAdmin, updateCustomerStatus);

module.exports = router;