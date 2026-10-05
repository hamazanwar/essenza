const express = require("express");
const router = express.Router();

const {
    getActiveProducts,
    getActiveProductById
} = require("../controllers/publicProductController");

// GET ALL ACTIVE PRODUCTS
router.get("/", getActiveProducts);

// GET SINGLE ACTIVE PRODUCT
router.get("/:productId", getActiveProductById);

module.exports = router;