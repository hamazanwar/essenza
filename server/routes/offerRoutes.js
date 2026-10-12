
const express = require("express");
const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
    createOffer,
    getAllOffers,
    getActiveOffers,
    updateOffer,
    deleteOffer,
} = require("../controllers/offerController");

// Customer-side route: active offers only
router.get("/active", getActiveOffers);

// Admin routes
router.get("/", protectAdmin, getAllOffers);
router.post("/", protectAdmin, createOffer);
router.patch("/:id", protectAdmin, updateOffer);
router.delete("/:id", protectAdmin, deleteOffer);

module.exports = router;
