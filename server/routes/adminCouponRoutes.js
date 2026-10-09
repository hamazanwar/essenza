
const express = require("express");
const router = express.Router();

const protectAdmin = require("../middleware/adminAuthMiddleware");

const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} = require("../controllers/couponController");

router.use(protectAdmin);

router.get("/", getCoupons);
router.post("/", createCoupon);
router.patch("/:couponId", updateCoupon);
router.patch("/:couponId/status", toggleCouponStatus);
router.delete("/:couponId", deleteCoupon);

module.exports = router;
