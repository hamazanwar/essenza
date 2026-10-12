const express = require("express");

const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
    getAllCustomers,
    updateCustomerStatus,
    getCustomerDetails,
    getCustomerWallet,
    reviewWithdrawalRequest,
    completeWithdrawalPayout
} = require("../controllers/customerController");



// Get all customers
router.get("/", protectAdmin, getAllCustomers);

// Get customer details
router.get("/:id", protectAdmin, getCustomerDetails);

router.patch("/:id/status", protectAdmin, updateCustomerStatus);

router.get("/:id/wallet", protectAdmin, getCustomerWallet);

router.patch(
    "/:id/wallet/withdrawals/:requestId",
    protectAdmin,
    reviewWithdrawalRequest
);

router.patch(
    "/:id/wallet/withdrawals/:requestId/complete",
    protectAdmin,
    completeWithdrawalPayout
);

module.exports = router;