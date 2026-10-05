const express = require("express");
const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
    getAllCategories,
    addCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory
} = require("../controllers/categoryController");

// GET ALL CATEGORIES
router.get(
    "/",
    protectAdmin,
    getAllCategories
);

// ADD CATEGORY
router.post(
    "/",
    protectAdmin,
    addCategory
);

// UPDATE CATEGORY
router.patch(
    "/:id",
    protectAdmin,
    updateCategory
);

// ACTIVATE / DEACTIVATE CATEGORY
router.patch(
    "/:id/status",
    protectAdmin,
    updateCategoryStatus
);

// DELETE CATEGORY
router.delete(
    "/:id",
    protectAdmin,
    deleteCategory
);

module.exports = router;