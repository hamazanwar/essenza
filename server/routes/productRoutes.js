const express = require("express");
const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");
const uploadProductImage = require("../config/productUpload");

const {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    updateProductStatus
} = require("../controllers/productController");

// ADD PRODUCT
router.post(
    "/",
    protectAdmin,
    uploadProductImage.array("productImages", 5),
    addProduct
);

// GET ALL PRODUCTS
router.get(
    "/",
    protectAdmin,
    getAllProducts
);

// UPDATE PRODUCT
router.patch(
    "/:id",
    protectAdmin,
    uploadProductImage.array("productImages", 5),
    updateProduct
);

// DELETE PRODUCT
router.delete(
    "/:id",
    protectAdmin,
    deleteProduct
);

// ACTIVATE / DEACTIVATE PRODUCT
router.patch(
    "/:id/status",
    protectAdmin,
    updateProductStatus
);

module.exports = router;