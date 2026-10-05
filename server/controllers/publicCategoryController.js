const {
    getActiveCategoriesService
} = require("../services/categoryService");

// GET ACTIVE CATEGORIES FOR USERS
const getActiveCategories = async (req, res) => {
    try {
        const result =
            await getActiveCategoriesService();

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Get active categories error:",
            error
        );

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Server error"
        });
    }
};

module.exports = {
    getActiveCategories
};