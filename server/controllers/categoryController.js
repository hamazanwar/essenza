const {
    getAllCategoriesService,
    addCategoryService,
    updateCategoryService,
    updateCategoryStatusService,
    deleteCategoryService
} = require("../services/categoryService");

// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
    try {
        const result = await getAllCategoriesService();

        res.status(200).json(result);

    } catch (error) {
        console.error("Get categories error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Server error"
        });
    }
};

// ADD CATEGORY
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const result = await addCategoryService(name);

        res.status(201).json(result);

    } catch (error) {
        console.error("Add category error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Server error"
        });
    }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const result =
            await updateCategoryService(id, name);

        res.status(200).json(result);

    } catch (error) {
        console.error("Update category error:", error);

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Server error"
        });
    }
};

// TOGGLE CATEGORY STATUS
const updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const result =
            await updateCategoryStatusService(id);

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Update category status error:",
            error
        );

        res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Server error"
        });
    }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result =
            await deleteCategoryService(id);

        res.status(200).json(result);

    } catch (error) {
        console.error(
            "Delete category error:",
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
    getAllCategories,
    addCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory
};