const Wishlist = require("../models/wishlist");
const Product = require("../models/product");

// ==========================================
// ADD PRODUCT TO WISHLIST
// ==========================================

const addToWishlistService = async (
    userId,
    productId
) => {

    // CHECK PRODUCT
    const product = await Product.findOne({
        _id: productId,
        isActive: true
    });

    if (!product) {
        const error = new Error(
            "Product not found"
        );

        error.statusCode = 404;

        throw error;
    }

    // FIND USER WISHLIST
    let wishlist = await Wishlist.findOne({
        userId
    });

    // CREATE WISHLIST IF IT DOES NOT EXIST
    if (!wishlist) {

        wishlist = await Wishlist.create({
            userId,
            products: [
                {
                    productId
                }
            ]
        });

        return {
            message: "Product added to wishlist",
            wishlist
        };
    }

    // CHECK WHETHER PRODUCT ALREADY EXISTS
    const existingProduct =
        wishlist.products.find(
            (item) =>
                item.productId.toString() ===
                productId.toString()
        );

    if (existingProduct) {
        const error = new Error(
            "Product already exists in wishlist"
        );

        error.statusCode = 400;

        throw error;
    }

    // ADD PRODUCT
    wishlist.products.push({
        productId
    });

    await wishlist.save();

    return {
        message: "Product added to wishlist",
        wishlist
    };
};


// ==========================================
// GET USER WISHLIST
// ==========================================

const getWishlistService = async (userId) => {

    const wishlist = await Wishlist.findOne({
        userId
    });

    // NO WISHLIST
    if (!wishlist) {
        return {
            message: "Wishlist fetched successfully",
            wishlist: {
                userId,
                products: []
            }
        };
    }

    // ==========================================
    // REMOVE DEACTIVATED PRODUCTS
    // ==========================================

    const activeProducts = [];

    for (const item of wishlist.products) {

        const product = await Product.findOne({
            _id: item.productId,
            isActive: true
        });

        if (product) {
            activeProducts.push(item);
        }
    }

    // CHECK WHETHER WISHLIST CHANGED
    const wishlistChanged =
        activeProducts.length !==
        wishlist.products.length;

    if (wishlistChanged) {

        wishlist.products =
            activeProducts;

        await wishlist.save();
    }

    // ==========================================
    // POPULATE PRODUCTS
    // ==========================================

    await wishlist.populate({
        path: "products.productId",
        select: "name productImage categoryId",
        populate: {
            path: "categoryId",
            select: "name"
        }
    });

    return {
        message: "Wishlist fetched successfully",
        wishlist
    };
};


// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================

const removeFromWishlistService = async (
    userId,
    productId
) => {

    const wishlist = await Wishlist.findOne({
        userId
    });

    if (!wishlist) {
        const error = new Error(
            "Wishlist not found"
        );

        error.statusCode = 404;

        throw error;
    }

    // FIND PRODUCT
    const productIndex =
        wishlist.products.findIndex(
            (item) =>
                item.productId.toString() ===
                productId.toString()
        );

    if (productIndex === -1) {
        const error = new Error(
            "Product not found in wishlist"
        );

        error.statusCode = 404;

        throw error;
    }

    // REMOVE PRODUCT
    wishlist.products.splice(
        productIndex,
        1
    );

    await wishlist.save();

    // POPULATE PRODUCTS
    await wishlist.populate({
        path: "products.productId",
        select: "name productImage categoryId",
        populate: {
            path: "categoryId",
            select: "name"
        }
    });

    return {
        message: "Product removed from wishlist",
        wishlist
    };
};


module.exports = {
    addToWishlistService,
    getWishlistService,
    removeFromWishlistService
};