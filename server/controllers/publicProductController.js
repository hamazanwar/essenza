const {
    getActiveProductsService,
    getActiveProductByIdService
} = require("../services/productService");

// GET ACTIVE PRODUCTS FOR USER
const getActiveProducts = async (req, res) => {
    try {

        const { category } = req.query;

        const result =
            await getActiveProductsService(
                category
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get active products error:",
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

// GET SINGLE ACTIVE PRODUCT FOR USER
const getActiveProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const result =
            await getActiveProductByIdService(
                productId
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get active product by ID error:",
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
    getActiveProducts,
    getActiveProductById
};