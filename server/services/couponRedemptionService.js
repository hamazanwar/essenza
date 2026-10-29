
const Coupon = require("../models/Coupon");
const PaymentAttempt = require("../models/PaymentAttempt");

const roundMoney = (amount) =>
  Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

const getValidCoupon = async ({ couponId, subtotal, session }) => {
  if (!couponId) return { coupon: null, discount: 0 };

  let query = Coupon.findById(couponId);
  if (session) query = query.session(session);

  const coupon = await query;

  if (!coupon) throw new Error("Coupon not found.");

  const now = new Date();

  if (
    !coupon.isActive ||
    coupon.startDate > now ||
    coupon.expiryDate <= now
  ) {
    throw new Error("This coupon is expired or unavailable.");
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new Error(
      `Minimum order amount is ₹${coupon.minOrderAmount}.`
    );
  }

  let discount =
    coupon.discountType === "PERCENTAGE"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount != null) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  discount = roundMoney(Math.min(discount, subtotal));

  return { coupon, discount };
};

// Atomically reserve a coupon use before creating a payment attempt.
const reserveCoupon = async ({ couponId, subtotal, session }) => {
  if (!couponId) return { coupon: null, discount: 0 };

  const { coupon, discount } = await getValidCoupon({
    couponId,
    subtotal,
    session,
  });

  const now = new Date();

  let query = Coupon.findOneAndUpdate(
    {
      _id: coupon._id,
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gt: now },
      $expr: {
        $or: [
          { $eq: [{ $ifNull: ["$usageLimit", null] }, null] },
          {
            $lt: [
              {
                $add: [
                  "$usedCount",
                  { $ifNull: ["$reservedCount", 0] },
                ],
              },
              "$usageLimit",
            ],
          },
        ],
      },
    },
    { $inc: { reservedCount: 1 } },
    { new: true }
  );

  if (session) query = query.session(session);

  const reservedCoupon = await query;

  if (!reservedCoupon) {
    throw new Error("This coupon has reached its usage limit.");
  }

  return { coupon: reservedCoupon, discount };
};

// Complete only if this specific attempt owns a RESERVED coupon.
const completeCouponReservation = async ({
  paymentAttemptId,
  session,
}) => {
  if (!paymentAttemptId) {
    throw new Error("Payment attempt ID is required.");
  }

  let attemptQuery = PaymentAttempt.findOneAndUpdate(
    {
      _id: paymentAttemptId,
      couponReservationStatus: "RESERVED",
    },
    { $set: { couponReservationStatus: "COMPLETED" } },
    { new: true }
  );

  if (session) attemptQuery = attemptQuery.session(session);

  const attempt = await attemptQuery;

  if (!attempt || !attempt.couponId) {
    throw new Error("No active coupon reservation exists for this payment attempt.");
  }

  let couponQuery = Coupon.findOneAndUpdate(
    {
      _id: attempt.couponId,
      reservedCount: { $gt: 0 },
    },
    { $inc: { reservedCount: -1, usedCount: 1 } },
    { new: true }
  );

  if (session) couponQuery = couponQuery.session(session);

  const coupon = await couponQuery;

  if (!coupon) {
    throw new Error("Coupon reservation could not be completed.");
  }

  return coupon;
};

// Release only if this specific attempt owns a RESERVED coupon.
const releaseCouponReservation = async ({
  paymentAttemptId,
  session,
}) => {
  if (!paymentAttemptId) {
    throw new Error("Payment attempt ID is required.");
  }

  let attemptQuery = PaymentAttempt.findOneAndUpdate(
    {
      _id: paymentAttemptId,
      couponReservationStatus: "RESERVED",
    },
    { $set: { couponReservationStatus: "RELEASED" } },
    { new: true }
  );

  if (session) attemptQuery = attemptQuery.session(session);

  const attempt = await attemptQuery;

  if (!attempt || !attempt.couponId) {
    throw new Error("No active coupon reservation exists for this payment attempt.");
  }

  let couponQuery = Coupon.findOneAndUpdate(
    {
      _id: attempt.couponId,
      reservedCount: { $gt: 0 },
    },
    { $inc: { reservedCount: -1 } },
    { new: true }
  );

  if (session) couponQuery = couponQuery.session(session);

  const coupon = await couponQuery;

  if (!coupon) {
    throw new Error("Coupon reservation could not be released.");
  }

  return coupon;
};

// Atomically consume a coupon for a non-Razorpay order.
// Call inside the same transaction as creating the order.

const consumeCouponUse = async ({ couponId, session }) => {
  if (!couponId) return null;

  const now = new Date();

  let query = Coupon.findOneAndUpdate(
    {
      _id: couponId,
      isActive: true,
      startDate: { $lte: now },
      expiryDate: { $gt: now },
      $expr: {
        $or: [
          {
            $eq: [{ $ifNull: ["$usageLimit", null] }, null],
          },
          {
            $lt: [
              {
                $add: [
                  "$usedCount",
                  { $ifNull: ["$reservedCount", 0] },
                ],
              },
              "$usageLimit",
            ],
          },
        ],
      },
    },
    {
      $inc: { usedCount: 1 },
    },
    { new: true }
  );

  if (session) {
    query = query.session(session);
  }

  const coupon = await query;

  if (!coupon) {
    throw new Error(
      "This coupon has reached its usage limit or is unavailable."
    );
  }

  return coupon;
};


module.exports = {
  getValidCoupon,
  consumeCouponUse,
  reserveCoupon,
  completeCouponReservation,
  releaseCouponReservation,
};
