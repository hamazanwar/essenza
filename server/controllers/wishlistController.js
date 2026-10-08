const {
    addToWishlistService,
    getWishlistService,
    removeFromWishlistService
} = require("../services/wishlistService");

// ==========================================
// ADD PRODUCT TO WISHLIST
// ==========================================

const addToWishlist = async (req, res) => {

    try {

        const userId = req.user.userId;

        const { productId } = req.body;

        // CHECK PRODUCT ID
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const result =
            await addToWishlistService(
                userId,
                productId
            );

        return res.status(201).json(result);

    } catch (error) {

        console.error(
            "Add to wishlist error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to add product to wishlist"
        });
    }
};


// ==========================================
// GET USER WISHLIST
// ==========================================

const getWishlist = async (req, res) => {

    try {

        const userId = req.user.userId;

        const result =
            await getWishlistService(
                userId
            );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get wishlist error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to get wishlist"
        });
    }
};


// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================

const removeFromWishlist = async (
    req,
    res
) => {

    try {

        const userId = req.user.userId;

        const { productId } = req.params;

        // CHECK PRODUCT ID
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const result =
            await removeFromWishlistService(
                userId,
                productId
            );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "Remove from wishlist error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to remove product from wishlist"
        });
    }
};


module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};