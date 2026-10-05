const {
    addToCartService,
    getCartService,
    removeFromCartService,
    updateCartItemQuantityService
} = require("../services/cartService");

// ==========================================
// ADD TO CART
// ==========================================

const addToCart = async (req, res) => {
    try {

        const userId =
            req.user.userId;

        const {
            productId,
            variantId,
            quantity
        } = req.body;

        if (
            !productId ||
            !variantId ||
            !quantity
        ) {
            return res.status(400).json({
                message:
                    "Product, variant and quantity are required"
            });
        }

        if (
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                message:
                    "Quantity must be at least 1"
            });
        }

        const result =
            await addToCartService(
                userId,
                productId,
                variantId,
                quantity
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Add to cart error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};


// ==========================================
// GET CART
// ==========================================

const getCart = async (req, res) => {
    try {

        const userId =
            req.user.userId;

        const result =
            await getCartService(
                userId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get cart error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};


// ==========================================
// REMOVE FROM CART
// ==========================================

const removeFromCart = async (
    req,
    res
) => {
    try {

        const userId =
            req.user.userId;

        const { itemId } =
            req.params;

        const result =
            await removeFromCartService(
                userId,
                itemId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Remove from cart error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};

// UPDATE CART ITEM QUANTITY
const updateCartItemQuantity = async (
    req,
    res
) => {
    try {
        const userId =
            req.user.userId;

        const { itemId } =
            req.params;

        const { quantity } =
            req.body;

        if (
            quantity === undefined ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                message:
                    "Quantity must be at least 1"
            });
        }

        const result =
            await updateCartItemQuantityService(
                userId,
                itemId,
                quantity
            );

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Update cart quantity error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};


module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCartItemQuantity
};