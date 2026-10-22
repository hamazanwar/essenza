const Wishlist = require("../models/wishlist");
const Product = require("../models/product");
const Variant = require("../models/variant");

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
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        return {
            message: "Wishlist fetched successfully",
            wishlist: {
                userId,
                products: []
            }
        };
    }

    // Remove deactivated products
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

    if (activeProducts.length !== wishlist.products.length) {
        wishlist.products = activeProducts;
        await wishlist.save();
    }

    // Populate product and category details
    await wishlist.populate({
        path: "products.productId",
        select: "name productImage categoryId",
        populate: {
            path: "categoryId",
            select: "name"
        }
    });

    // Retrieve variants from the separate Variant collection
    const productsWithVariants = await Promise.all(
        wishlist.products.map(async (item) => {
            const product = item.productId;

            if (!product) {
                return item;
            }

            const variants = await Variant.find({
                productId: product._id
            }).select("_id size price stock");

            return {
                ...item.toObject(),
                productId: {
                    ...product.toObject(),
                    variants
                }
            };
        })
    );

    return {
        message: "Wishlist fetched successfully",
        wishlist: {
            ...wishlist.toObject(),
            products: productsWithVariants
        }
    };
};



// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================


const removeFromWishlistService = async (userId, productId) => {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        const error = new Error("Wishlist not found");
        error.statusCode = 404;
        throw error;
    }

    const productIndex = wishlist.products.findIndex(
        (item) => item.productId.toString() === productId.toString()
    );

    if (productIndex === -1) {
        const error = new Error("Product not found in wishlist");
        error.statusCode = 404;
        throw error;
    }

    // Remove product
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    // Populate remaining products
    await wishlist.populate({
        path: "products.productId",
        select: "name productImage categoryId",
        populate: {
            path: "categoryId",
            select: "name"
        }
    });

    // Attach variants to each remaining product
    const productsWithVariants = await Promise.all(
        wishlist.products.map(async (item) => {
            const product = item.productId;

            if (!product) {
                return item;
            }

            const variants = await Variant.find({
                productId: product._id
            }).select("_id size price stock");

            return {
                ...item.toObject(),
                productId: {
                    ...product.toObject(),
                    variants
                }
            };
        })
    );

    return {
        message: "Product removed from wishlist",
        wishlist: {
            ...wishlist.toObject(),
            products: productsWithVariants
        }
    };
};



module.exports = {
    addToWishlistService,
    getWishlistService,
    removeFromWishlistService
};