
const Coupon = require("../models/Coupon");

const validateCouponData = (data) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount = 0,
    maxDiscount = null,
    startDate,
    expiryDate,
    usageLimit = null,
  } = data;

  if (!code || !code.trim()) {
    throw new Error("Coupon code is required.");
  }

  if (!["PERCENTAGE", "FIXED"].includes(discountType)) {
    throw new Error("Select a valid discount type.");
  }

  if (
    discountValue === undefined ||
    discountValue === null ||
    !Number.isFinite(Number(discountValue)) ||
    Number(discountValue) <= 0
  ) {
    throw new Error("Discount value must be greater than zero.");
  }

  if (
    discountType === "PERCENTAGE" &&
    Number(discountValue) > 100
  ) {
    throw new Error("Percentage discount cannot exceed 100%.");
  }

  if (
    !Number.isFinite(Number(minOrderAmount)) ||
    Number(minOrderAmount) < 0
  ) {
    throw new Error("Minimum order amount cannot be negative.");
  }

  if (
    maxDiscount !== null &&
    maxDiscount !== "" &&
    (!Number.isFinite(Number(maxDiscount)) ||
      Number(maxDiscount) < 0)
  ) {
    throw new Error("Maximum discount cannot be negative.");
  }

  if (
    usageLimit !== null &&
    usageLimit !== "" &&
    (!Number.isInteger(Number(usageLimit)) ||
      Number(usageLimit) < 1)
  ) {
    throw new Error("Usage limit must be a positive whole number.");
  }

  const start = new Date(startDate);
  const expiry = new Date(expiryDate);

  if (
    !startDate ||
    !expiryDate ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(expiry.getTime())
  ) {
    throw new Error("Valid start and expiry dates are required.");
  }

  if (expiry <= start) {
    throw new Error("Expiry date must be after the start date.");
  }

  return {
    code: code.trim().toUpperCase(),
    description: data.description || "",
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount),
    maxDiscount:
      maxDiscount === null || maxDiscount === ""
        ? null
        : Number(maxDiscount),
    startDate: start,
    expiryDate: expiry,
    usageLimit:
      usageLimit === null || usageLimit === ""
        ? null
        : Number(usageLimit),
    isActive:
      data.isActive === undefined ? true : data.isActive,
  };
};

const createCouponService = async (data) => {
  const couponData = validateCouponData(data);
  return await Coupon.create(couponData);
};

const getCouponsService = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(50, Math.max(1, Number(limit) || 10));

  const filter = {};

  if (search.trim()) {
    const escapedSearch = search.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.$or = [
      { code: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage),
    Coupon.countDocuments(filter),
  ]);

  return {
    coupons,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

const updateCouponService = async (couponId, data) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new Error("Coupon not found.");
  }

  const couponData = validateCouponData({
    ...coupon.toObject(),
    ...data,
    // Do not reset the usage count when editing a coupon.
    usedCount: coupon.usedCount,
  });

  Object.assign(coupon, couponData);

  return await coupon.save();
};

const deleteCouponService = async (couponId) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new Error("Coupon not found.");
  }

  await coupon.deleteOne();

  return coupon;
};

const toggleCouponStatusService = async (couponId) => {
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new Error("Coupon not found.");
  }

  coupon.isActive = !coupon.isActive;

  return await coupon.save();
};

module.exports = {
  createCouponService,
  getCouponsService,
  updateCouponService,
  deleteCouponService,
  toggleCouponStatusService,
};
