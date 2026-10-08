const Category = require("../models/category");

// GET ALL CATEGORIES
const getAllCategoriesService = async () => {
    const categories = await Category.find()
        .sort({ createdAt: -1 });

    return {
        message: "Categories fetched successfully",
        categories
    };
};

// ADD CATEGORY
const addCategoryService = async (name) => {
    const trimmedName = name.trim();

    const existingCategory = await Category.findOne({
        name: {
            $regex: `^${trimmedName}$`,
            $options: "i"
        }
    });

    if (existingCategory) {
        const error = new Error("Category already exists");
        error.statusCode = 409;
        throw error;
    }

    const category = await Category.create({
        name: trimmedName
    });

    return {
        message: "Category added successfully",
        category
    };
};

// UPDATE CATEGORY
const updateCategoryService = async (categoryId, name) => {
    const category = await Category.findById(categoryId);

    if (!category) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    const trimmedName = name.trim();

const existingCategory = await Category.findOne({
    name: {
        $regex: `^${trimmedName}$`,
        $options: "i"
    },
    _id: { $ne: categoryId }
});

    if (existingCategory) {
        const error = new Error("Category already exists");
        error.statusCode = 409;
        throw error;
    }

    category.name = trimmedName;

    await category.save();

    return {
        message: "Category updated successfully",
        category
    };
};

// TOGGLE CATEGORY STATUS
const updateCategoryStatusService = async (categoryId) => {
    const category = await Category.findById(categoryId);

    if (!category) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    category.isActive = !category.isActive;

    await category.save();

    return {
        message: category.isActive
            ? "Category activated successfully"
            : "Category deactivated successfully",
        category
    };
};

// GET ACTIVE CATEGORIES FOR USERS
const getActiveCategoriesService = async () => {
    const categories = await Category.find({
        isActive: true
    }).sort({
        createdAt: -1
    });

    return {
        message: "Active categories fetched successfully",
        categories
    };
};

// DELETE CATEGORY
const deleteCategoryService = async (categoryId) => {
    const category = await Category.findById(categoryId);

    if (!category) {
        const error = new Error("Category not found");
        error.statusCode = 404;
        throw error;
    }

    await Category.findByIdAndDelete(categoryId);

    return {
        message: "Category deleted successfully"
    };
};

module.exports = {
    getAllCategoriesService,
    addCategoryService,
    updateCategoryService,
    updateCategoryStatusService,
    getActiveCategoriesService,
    deleteCategoryService
};