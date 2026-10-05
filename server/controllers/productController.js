const {
    addProductService,
    getAllProductsService,
    updateProductService,
    deleteProductService,
    updateProductStatusService
} = require("../services/productService");

// ADD PRODUCT
const addProduct = async (req, res) => {
    try {
        const {
    categoryId,
    name,
    description,
    fragranceNotes,
    ingredients,
    howToUse,
    shippingAndReturns
} = req.body;

        if (
            !categoryId ||
            !name ||
            !description
        ) {
            return res.status(400).json({
                message:
                    "Category, name and description are required"
            });
        }

        const productImages =
    req.files?.map(
        (file) =>
            `/uploads/product/${file.filename}`
    ) || [];

const result =
    await addProductService(
        categoryId,
        name,
        productImages,
        description,
        fragranceNotes,
        ingredients,
        howToUse,
        shippingAndReturns
    );

        res.status(201).json(result);

    } catch (error) {
        console.error(
            "Add product error:",
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

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        const result =
            await getAllProductsService();

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Get all products error:",
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

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
    categoryId,
    name,
    description,
    existingImages,
    fragranceNotes,
    ingredients,
    howToUse,
    shippingAndReturns
} = req.body;

        if (
            !categoryId ||
            !name ||
            !description
        ) {
            return res.status(400).json({
                message:
                    "Category, name and description are required"
            });
        }

        const productImages =
            req.files?.map(
                (file) =>
                    `/uploads/product/${file.filename}`
            ) || [];

        const result =
    await updateProductService(
        id,
        categoryId,
        name,
        existingImages,
        productImages,
        description,
        fragranceNotes,
        ingredients,
        howToUse,
        shippingAndReturns
    );

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Update product error:",
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

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const result =
            await deleteProductService(id);

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Delete product error:",
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

// TOGGLE PRODUCT STATUS
const updateProductStatus = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const result =
            await updateProductStatusService(
                id
            );

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Update product status error:",
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
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    updateProductStatus
};