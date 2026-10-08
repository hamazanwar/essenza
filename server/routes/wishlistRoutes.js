const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require("../controllers/wishlistController");

// ==========================================
// ADD PRODUCT TO WISHLIST
// ==========================================

router.post(
    "/",
    protect,
    addToWishlist
);

// ==========================================
// GET USER WISHLIST
// ==========================================

router.get(
    "/",
    protect,
    getWishlist
);

// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================

router.delete(
    "/:productId",
    protect,
    removeFromWishlist
);

module.exports = router;