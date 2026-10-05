const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItemQuantity
} = require("../controllers/cartController");

// ==========================================
// ADD PRODUCT TO CART
// ==========================================

router.post(
    "/",
    protect,
    addToCart
);

// ==========================================
// GET USER CART
// ==========================================

router.get(
    "/",
    protect,
    getCart
);

// ==========================================
// REMOVE ITEM FROM CART
// ==========================================

router.delete(
    "/:itemId",
    protect,
    removeFromCart
);

// UPDATE CART ITEM QUANTITY
router.patch(
    "/:itemId",
    protect,
    updateCartItemQuantity
);

module.exports = router;