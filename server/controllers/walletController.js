
const PaymentAttempt = require("../models/PaymentAttempt");

const {
  getWalletDetailsService,
  applyWalletTransactionService,
} = require("../services/walletService");

const {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
  fetchVerifiedPaymentService,
} = require("../services/razorpayService");

const {
  createWithdrawalRequestService,
} = require("../services/withdrawalService");

// GET wallet balance and recent transactions
const getWalletDetails = async (req, res) => {
  try {
    const wallet = await getWalletDetailsService(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Wallet details retrieved successfully.",
      data: wallet,
    });
  } catch (error) {
    console.error("Get wallet details error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve wallet details.",
    });
  }
};

// POST create a Razorpay order for wallet top-up
const createWalletTopUpOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const amount = Number(req.body.amount);

    if (
      !Number.isFinite(amount) ||
      amount < 1 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid amount of at least ₹1, with up to two decimal places.",
      });
    }

    const razorpayOrder = await createRazorpayOrderService(amount);

    await PaymentAttempt.create({
      userId,
      purpose: "WALLET_TOPUP",
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      status: "CREATED",
    });

    return res.status(201).json({
      success: true,
      message: "Wallet top-up order created successfully.",
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error("Create wallet top-up order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create wallet top-up order.",
    });
  }
};

// POST verify Razorpay payment and credit wallet
const verifyWalletTopUp = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing.",
      });
    }

    // Find the payment attempt belonging to this user.
    const attempt = await PaymentAttempt.findOne({
      userId,
      purpose: "WALLET_TOPUP",
      razorpayOrderId,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Wallet top-up payment attempt not found.",
      });
    }

    // A previously completed payment must not be credited again.
    if (attempt.status === "PAID") {
      if (attempt.paymentId !== razorpayPaymentId) {
        return res.status(409).json({
          success: false,
          message: "This order has already been paid with another payment.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Wallet top-up was already processed.",
      });
    }

    // Verify the signature and fetch the payment from Razorpay.
    verifyRazorpayPaymentService({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    const payment = await fetchVerifiedPaymentService({
      razorpayOrderId,
      razorpayPaymentId,
      expectedAmount: attempt.amount,
    });

    // Credit only after Razorpay confirms the payment is captured.
    const result = await applyWalletTransactionService({
      userId,
      type: "CREDIT",
      source: "ADD_MONEY",
      amount: attempt.amount / 100,
      referenceId: `razorpay_topup_${razorpayPaymentId}`,
      paymentId: razorpayPaymentId,
      description: "Wallet top-up through Razorpay",
    });

    // Mark the attempt paid only after wallet credit succeeds.
    attempt.status = "PAID";
    attempt.paymentId = razorpayPaymentId;
    await attempt.save();

    return res.status(200).json({
      success: true,
      message: result.duplicate
        ? "Wallet top-up was already processed."
        : "Wallet topped up successfully.",
    });
  } catch (error) {
    console.error("Verify wallet top-up error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Wallet payment verification failed.",
    });
  }
};


const createWithdrawalRequest = async (req, res) => {
  try {
    const withdrawal = await createWithdrawalRequestService({
      userId: req.user.userId,
      amount: req.body.amount,
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      data: {
        withdrawalRequest: withdrawal,
      },
    });
  } catch (error) {
    console.error("Create withdrawal request error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit withdrawal request.",
    });
  }
};


module.exports = {
  getWalletDetails,
  createWalletTopUpOrder,
  verifyWalletTopUp,
  createWithdrawalRequest
};
