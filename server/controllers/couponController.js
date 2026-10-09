
const {
  createCouponService,
  getCouponsService,
  updateCouponService,
  deleteCouponService,
  toggleCouponStatusService,
} = require("../services/couponService");

const createCoupon = async (req, res) => {
  try {
    const coupon = await createCouponService(req.body);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    const isDuplicate = error.code === 11000;

    return res.status(isDuplicate ? 409 : 400).json({
      success: false,
      message: isDuplicate
        ? "This coupon code already exists."
        : error.message,
    });
  }
};

const getCoupons = async (req, res) => {
  try {
    const result = await getCouponsService(req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupons.",
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await updateCouponService(
      req.params.couponId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully.",
      coupon,
    });
  } catch (error) {
    const isDuplicate = error.code === 11000;

    return res.status(
      isDuplicate ? 409 : error.message === "Coupon not found." ? 404 : 400
    ).json({
      success: false,
      message: isDuplicate
        ? "This coupon code already exists."
        : error.message,
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await deleteCouponService(req.params.couponId);

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    return res.status(
      error.message === "Coupon not found." ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await toggleCouponStatusService(
      req.params.couponId
    );

    return res.status(200).json({
      success: true,
      message: "Coupon status updated successfully.",
      coupon,
    });
  } catch (error) {
    return res.status(
      error.message === "Coupon not found." ? 404 : 400
    ).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
};
