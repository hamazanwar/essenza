
const express = require("express");
const router = express.Router();

const {
  getAvailableCoupons,
} = require("../controllers/couponController");

router.get("/", getAvailableCoupons);

module.exports = router;
