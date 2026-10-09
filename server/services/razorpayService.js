
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrderService = async (amount) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid payment amount.");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `essenza_${Date.now()}`,
  });

  return razorpayOrder;
};

const verifyRazorpayPaymentService = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  if (
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    throw new Error("Payment verification details are missing.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(razorpaySignature);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new Error("Payment verification failed.");
  }

  return true;
};


const fetchVerifiedPaymentService = async ({
  razorpayOrderId,
  razorpayPaymentId,
  expectedAmount,
}) => {
  const payment = await razorpay.payments.fetch(
    razorpayPaymentId
  );

  if (payment.order_id !== razorpayOrderId) {
    throw new Error("Payment does not match the Razorpay order.");
  }

  if (payment.amount !== expectedAmount) {
    throw new Error("Payment amount does not match.");
  }

  if (payment.currency !== "INR") {
    throw new Error("Invalid payment currency.");
  }

  if (payment.status !== "captured") {
    throw new Error("Payment has not been completed.");
  }

  return payment;
};


module.exports = {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
  fetchVerifiedPaymentService
};
