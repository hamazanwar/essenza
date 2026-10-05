const express = require("express");

const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
    addVariant,
    getVariantsByProduct,
    updateVariant,
    deleteVariant
} = require("../controllers/variantController");


// ADD VARIANT
router.post(
    "/",
    protectAdmin,
    addVariant
);


// GET VARIANTS FOR A PRODUCT
router.get(
    "/product/:productId",
    protectAdmin,
    getVariantsByProduct
);

router.patch(
    "/:id",
    protectAdmin,
    updateVariant
);

router.delete(
    "/:id",
    protectAdmin,
    deleteVariant
);


module.exports = router;