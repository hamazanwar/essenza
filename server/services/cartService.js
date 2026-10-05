const Cart = require("../models/cart");
const Product = require("../models/product");
const Variant = require("../models/variant");

const populateCart = async (cart) => {
    return await cart.populate([
        {
            path: "items.productId",
            select: "name productImage"
        },
        {
            path: "items.variantId",
            select: "size price stock"
        }
    ]);
};

// ==========================================
// ADD ITEM TO CART
// ==========================================

const addToCartService = async (
    userId,
    productId,
    variantId,
    quantity
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

    // CHECK VARIANT
    const variant = await Variant.findOne({
        _id: variantId,
        productId: productId
    });

    if (!variant) {
        const error = new Error(
            "Product variant not found"
        );

        error.statusCode = 404;

        throw error;
    }

    // CHECK STOCK
    if (variant.stock < quantity) {
        const error = new Error(
            "Requested quantity is not available"
        );

        error.statusCode = 400;

        throw error;
    }

    // FIND USER CART
    let cart = await Cart.findOne({
        userId
    });

    // CREATE CART IF IT DOES NOT EXIST
    if (!cart) {

        cart = await Cart.create({
            userId,
            items: [
                {
                    productId,
                    variantId,
                    quantity
                }
            ]
        });

        return {
            message: "Product added to cart",
            cart
        };
    }

    // CHECK WHETHER SAME VARIANT ALREADY EXISTS
    const existingItem =
        cart.items.find(
            (item) =>
                item.productId.toString() ===
                    productId.toString() &&
                item.variantId.toString() ===
                    variantId.toString()
        );

    if (existingItem) {

        const newQuantity =
            existingItem.quantity + quantity;

        // CHECK TOTAL STOCK
        if (newQuantity > variant.stock) {
            const error = new Error(
                `Only ${variant.stock} items available in stock`
            );

            error.statusCode = 400;

            throw error;
        }

        existingItem.quantity =
            newQuantity;

    } else {

        cart.items.push({
            productId,
            variantId,
            quantity
        });
    }

    await cart.save();

    return {
        message: "Product added to cart",
        cart
    };
};


// ==========================================
// GET USER CART
// ==========================================

const getCartService = async (userId) => {

    const cart = await Cart.findOne({
        userId
    })
        .populate(
            "items.productId",
            "name productImage"
        )
        .populate(
            "items.variantId",
            "size price stock"
        );

    if (!cart) {

        return {
            message: "Cart fetched successfully",
            cart: {
                userId,
                items: []
            }
        };
    }

    return {
        message: "Cart fetched successfully",
        cart
    };
};

// ==========================================
// REMOVE ITEM FROM CART
// ==========================================

const removeFromCartService = async (
    userId,
    itemId
) => {

    const cart = await Cart.findOne({
        userId
    });

    if (!cart) {
        const error = new Error(
            "Cart not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const itemIndex =
        cart.items.findIndex(
            (item) =>
                item._id.toString() ===
                itemId.toString()
        );

    if (itemIndex === -1) {
        const error = new Error(
            "Cart item not found"
        );

        error.statusCode = 404;

        throw error;
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

await populateCart(cart);

return {
    message: "Product removed from cart",
    cart
};
};

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

const updateCartItemQuantityService = async (
    userId,
    itemId,
    quantity
) => {

    // FIND USER CART
    const cart = await Cart.findOne({
        userId
    });

    if (!cart) {
        const error = new Error(
            "Cart not found"
        );

        error.statusCode = 404;

        throw error;
    }

    // FIND CART ITEM
    const item =
        cart.items.find(
            (cartItem) =>
                cartItem._id.toString() ===
                itemId.toString()
        );

    if (!item) {
        const error = new Error(
            "Cart item not found"
        );

        error.statusCode = 404;

        throw error;
    }

    // FIND VARIANT
    const variant = await Variant.findOne({
        _id: item.variantId,
        productId: item.productId
    });

    if (!variant) {
        const error = new Error(
            "Product variant not found"
        );

        error.statusCode = 404;

        throw error;
    }

    // CHECK STOCK
    if (quantity > variant.stock) {
        const error = new Error(
            `Only ${variant.stock} items available in stock`
        );

        error.statusCode = 400;

        throw error;
    }

    // UPDATE QUANTITY
    item.quantity = quantity;

    await cart.save();

await populateCart(cart);

return {
    message: "Cart quantity updated successfully",
    cart
};
};


module.exports = {
    addToCartService,
    getCartService,
    removeFromCartService,
    updateCartItemQuantityService
};