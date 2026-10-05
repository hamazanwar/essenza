const express = require("express");
const router = express.Router();

const {
    getActiveCategories
} = require("../controllers/publicCategoryController");

// GET ACTIVE CATEGORIES FOR USERS
router.get(
    "/",
    getActiveCategories
);

module.exports = router;