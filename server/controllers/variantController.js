const {
  addVariantService,
  getVariantsByProductService,
  updateVariantService,
  deleteVariantService,
} = require("../services/variantService");

// ADD VARIANT
const addVariant = async (req, res) => {
  try {
    const { productId, size, price, stock } = req.body;

    if (
      !productId ||
      !size ||
      !size.trim() ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        message: "Product, size, price and stock are required",
      });
    }

    if (
      typeof Number(price) !== "number" ||
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    if (
      typeof Number(stock) !== "number" ||
      Number.isNaN(Number(stock)) ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        message: "Stock must be a valid non-negative number",
      });
    }

    const result = await addVariantService(productId, size, price, stock);

    res.status(201).json(result);
  } catch (error) {
    console.error("Add variant error:", error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

// GET VARIANTS BY PRODUCT
const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await getVariantsByProductService(productId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Get variants error:", error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const { size, price, stock } = req.body;

    if (!size || !size.trim() || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Size, price and stock are required",
      });
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    if (Number.isNaN(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({
        message: "Stock must be a valid non-negative number",
      });
    }

    const result = await updateVariantService(id, size, price, stock);

    res.status(200).json(result);
  } catch (error) {
    console.error("Update variant error:", error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteVariantService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error("Delete variant error:", error);

    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Server error",
    });
  }
};

module.exports = {
  addVariant,
  getVariantsByProduct,
  updateVariant,
  deleteVariant,
};
