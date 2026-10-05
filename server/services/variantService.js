const Variant = require("../models/variant");
const Product = require("../models/product");

// ADD VARIANT
const addVariantService = async (productId, size, price, stock) => {
  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");

    error.statusCode = 404;

    throw error;
  }

  // Check duplicate size
  const existingVariant = await Variant.findOne({
    productId,
    size: size.trim(),
  });

  if (existingVariant) {
    const error = new Error(
      "This variant size already exists for this product",
    );

    error.statusCode = 409;

    throw error;
  }

  const variant = await Variant.create({
    productId,
    productName: product.name,
    size: size.trim(),
    price,
    stock,
  });

  return {
    message: "Variant added successfully",
    variant,
  };
};

// GET VARIANTS BY PRODUCT
const getVariantsByProductService = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");

    error.statusCode = 404;

    throw error;
  }

  const variants = await Variant.find({
    productId,
  }).sort({
    price: 1,
  });

  return {
    variants,
  };
};

const updateVariantService = async (variantId, size, price, stock) => {
  const variant = await Variant.findById(variantId);

  if (!variant) {
    const error = new Error("Variant not found");

    error.statusCode = 404;

    throw error;
  }

  // Check duplicate size
  const existingVariant = await Variant.findOne({
    productId: variant.productId,
    size: size.trim(),
    _id: { $ne: variantId },
  });

  if (existingVariant) {
    const error = new Error(
      "This variant size already exists for this product",
    );

    error.statusCode = 409;

    throw error;
  }

  variant.size = size.trim();
  variant.price = price;
  variant.stock = stock;

  await variant.save();

  return {
    message: "Variant updated successfully",
    variant,
  };
};

const deleteVariantService = async (variantId) => {
  const variant = await Variant.findById(variantId);

  if (!variant) {
    const error = new Error("Variant not found");

    error.statusCode = 404;

    throw error;
  }

  await Variant.findByIdAndDelete(variantId);

  return {
    message: "Variant deleted successfully",
  };
};

module.exports = {
  addVariantService,
  getVariantsByProductService,
  updateVariantService,
  deleteVariantService,
};
