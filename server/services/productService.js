const Product = require("../models/product");
const Category = require("../models/category");
const Variant = require("../models/variant");
const fs = require("fs");
const path = require("path");

// ADD PRODUCT
const addProductService = async (
    categoryId,
    name,
    productImage,
    description,
    fragranceNotes,
    ingredients,
    howToUse,
    shippingAndReturns
) => {
    const category = await Category.findById(
        categoryId
    );

    if (!category) {
        const error = new Error(
            "Category not found"
        );

        error.statusCode = 404;

        throw error;
    }

    if (!category.isActive) {
        const error = new Error(
            "Cannot add product to an inactive category"
        );

        error.statusCode = 400;

        throw error;
    }

    const existingProduct = await Product.findOne({
        name: name.trim()
    });

    if (existingProduct) {
        const error = new Error(
            "Product already exists"
        );

        error.statusCode = 409;

        throw error;
    }

    const product = await Product.create({
    categoryId,
    name: name.trim(),
    productImage: productImage || [],
    description: description.trim(),
    fragranceNotes: fragranceNotes?.trim() || "",
    ingredients: ingredients?.trim() || "",
    howToUse: howToUse?.trim() || "",
    shippingAndReturns:
        shippingAndReturns?.trim() || ""
});

    return {
        message: "Product added successfully",
        product
    };
};

// GET ALL PRODUCTS
const getAllProductsService = async () => {
    const products = await Product.find()
        .populate("categoryId", "name")
        .sort({ createdAt: -1 });

    return {
        message: "Products fetched successfully",
        products
    };
};

// GET ACTIVE PRODUCTS FOR USER
const getActiveProductsService = async (categoryName) => {

    const products = await Product.find({
        isActive: true
    })
        .populate({
            path: "categoryId",
            select: "name",
            match: {
                isActive: true
            }
        })
        .sort({
            createdAt: -1
        });

    // Remove products whose category is inactive
    let activeProducts = products.filter(
        (product) => product.categoryId !== null
    );

    // Filter by category name if provided
    if (categoryName) {
        activeProducts = activeProducts.filter(
            (product) =>
                product.categoryId.name.toLowerCase() ===
                categoryName.toLowerCase()
        );
    }

    // Add variants to every product
    const productsWithVariants =
        await Promise.all(
            activeProducts.map(
                async (product) => {

                    const variants =
                        await Variant.find({
                            productId: product._id
                        })
                            .select(
                                "size price stock"
                            )
                            .sort({
                                price: 1
                            });

                    return {
                        ...product.toObject(),
                        variants
                    };
                }
            )
        );

    return {
        message:
            "Active products fetched successfully",
        products: productsWithVariants
    };
};

// GET SINGLE ACTIVE PRODUCT FOR USER
const getActiveProductByIdService = async (productId) => {
    const product = await Product.findOne({
        _id: productId,
        isActive: true
    })
        .populate({
            path: "categoryId",
            select: "name",
            match: {
                isActive: true
            }
        });

    if (!product || !product.categoryId) {
        const error = new Error(
            "Product not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const variants = await Variant.find({
        productId: product._id
    })
        .select("size price stock")
        .sort({
            price: 1
        });

    return {
        message: "Product fetched successfully",
        product: {
            ...product.toObject(),
            variants
        }
    };
};

// UPDATE PRODUCT
const updateProductService = async (
    productId,
    categoryId,
    name,
    existingImages,
    newProductImages,
    description,
    fragranceNotes,
    ingredients,
    howToUse,
    shippingAndReturns
) => {
    const product = await Product.findById(
        productId
    );

    if (!product) {
        const error = new Error(
            "Product not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const category = await Category.findById(
        categoryId
    );

    if (!category) {
        const error = new Error(
            "Category not found"
        );

        error.statusCode = 404;

        throw error;
    }

    if (!category.isActive) {
        const error = new Error(
            "Cannot assign product to an inactive category"
        );

        error.statusCode = 400;

        throw error;
    }

    const existingProduct =
        await Product.findOne({
            name: name.trim(),
            _id: { $ne: productId }
        });

    if (existingProduct) {
        const error = new Error(
            "Product already exists"
        );

        error.statusCode = 409;

        throw error;
    }

    let retainedImages = [];

    if (existingImages) {
        try {
            retainedImages =
                JSON.parse(existingImages);
        } catch (error) {
            retainedImages = [];
        }
    }

    const oldImages =
        product.productImage || [];

    // Delete images that were removed
    const removedImages =
        oldImages.filter(
            (image) =>
                !retainedImages.includes(image)
        );

    removedImages.forEach((image) => {
        const imagePath = path.join(
            __dirname,
            "..",
            image.replace(
                "/uploads/",
                "uploads/"
            )
        );

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    });

    // Combine retained images + new images
    const finalImages = [
        ...retainedImages,
        ...(newProductImages || [])
    ];

    product.categoryId = categoryId;
    product.name = name.trim();
    product.productImage = finalImages;
    product.description =
    description.trim();

product.fragranceNotes =
    fragranceNotes?.trim() || "";

product.ingredients =
    ingredients?.trim() || "";

product.howToUse =
    howToUse?.trim() || "";

product.shippingAndReturns =
    shippingAndReturns?.trim() || "";

    await product.save();

    await product.populate(
        "categoryId",
        "name"
    );

    return {
        message:
            "Product updated successfully",
        product
    };
};

// DELETE PRODUCT
const deleteProductService = async (productId) => {
    const product = await Product.findById(
        productId
    );

    if (!product) {
        const error = new Error(
            "Product not found"
        );

        error.statusCode = 404;

        throw error;
    }

    await Product.findByIdAndDelete(
        productId
    );

    return {
        message: "Product deleted successfully"
    };
};

// TOGGLE PRODUCT STATUS
const updateProductStatusService = async (
    productId
) => {
    const product = await Product.findById(
        productId
    );

    if (!product) {
        const error = new Error(
            "Product not found"
        );

        error.statusCode = 404;

        throw error;
    }

    product.isActive = !product.isActive;

    await product.save();

    return {
        message: product.isActive
            ? "Product activated successfully"
            : "Product deactivated successfully",
        product
    };
};

module.exports = {
    addProductService,
    getAllProductsService,
    updateProductService,
    deleteProductService,
    updateProductStatusService,
    getActiveProductsService,
    getActiveProductByIdService
};