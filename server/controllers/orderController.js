const Address = require("../models/Address");
const Product = require("../models/product");
const Variant = require("../models/variant");
const PaymentAttempt = require("../models/PaymentAttempt");

const {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
  fetchVerifiedPaymentService
} = require("../services/razorpayService");

const {
  createOrderService,
  getMyOrdersService,
  getOrderDetailsService,
  cancelOrderService,
  createPaidOnlineOrderService
} = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      addressId,
      items,
      paymentMethod,
    } = req.body;

    if (paymentMethod !== "COD") {
  return res.status(400).json({
    success: false,
    message:
      "Online payments must be completed through the secure payment flow.",
  });
}

    const order = await createOrderService({
      userId,
      addressId,
      items,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create order.",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await getMyOrdersService(userId);

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await getOrderDetailsService(userId, orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order details.",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await cancelOrderService(
      userId,
      orderId
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message || "Failed to cancel order.",
    });
  }
};


const createOnlinePaymentOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId, items } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Delivery address not found.",
      });
    }

    let subtotal = 0;

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (
        !item.productId ||
        !item.variantId ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order item.",
        });
      }

      const product = await Product.findOne({
        _id: item.productId,
        isActive: true,
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product is no longer available.",
        });
      }

      const variant = await Variant.findOne({
        _id: item.variantId,
        productId: item.productId,
      });

      if (!variant || variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is unavailable in the requested quantity.`,
        });
      }

      subtotal += variant.price * quantity;
    }

    const deliveryCharge = 0;
    const totalAmount = subtotal + deliveryCharge;

    const razorpayOrder =
  await createRazorpayOrderService(totalAmount);

await PaymentAttempt.create({
  userId,
  addressId,
  items: items.map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    quantity: Number(item.quantity),
  })),
  razorpayOrderId: razorpayOrder.id,
  amount: razorpayOrder.amount,
  status: "CREATED",
});

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully.",
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Create online payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to initiate online payment.",
    });
  }
};





const verifyOnlinePayment = async (req, res) => {
  let attemptId = null;
  let claimed = false;

  try {
    const userId = req.user.userId;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing.",
      });
    }

    const attempt = await PaymentAttempt.findOne({
      userId,
      razorpayOrderId: razorpay_order_id,
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Payment attempt not found.",
      });
    }

    attemptId = attempt._id;

    // Return the existing order when the payment was already processed.
    if (attempt.status === "PAID") {
      const existingOrder = await require("../models/Order").findOne({
        paymentId: razorpay_payment_id,
        userId,
      });

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Payment was already verified.",
          order: existingOrder,
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "Payment was marked as paid but its order was not found. Contact support.",
      });
    }

    if (attempt.status === "PROCESSING") {
      return res.status(409).json({
        success: false,
        message: "Payment verification is already in progress. Please wait.",
      });
    }

    // Claim this attempt atomically before creating an order.
    const claimedAttempt = await PaymentAttempt.findOneAndUpdate(
      {
        _id: attempt._id,
        userId,
        status: "CREATED",
      },
      {
        $set: { status: "PROCESSING" },
      },
      { new: true }
    );

    if (!claimedAttempt) {
      return res.status(409).json({
        success: false,
        message: "This payment attempt is already being processed.",
      });
    }

    claimed = true;

    // Validate the Razorpay signature.
    verifyRazorpayPaymentService({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // Confirm the payment with Razorpay.
    await fetchVerifiedPaymentService({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      expectedAmount: claimedAttempt.amount,
    });

    // Create the order using the server-saved checkout details.
    const order = await createPaidOnlineOrderService({
      userId,
      addressId: claimedAttempt.addressId,
      items: claimedAttempt.items,
      razorpayPaymentId: razorpay_payment_id,
    });

    claimedAttempt.status = "PAID";
    claimedAttempt.paymentId = razorpay_payment_id;
    await claimedAttempt.save();

    return res.status(201).json({
      success: true,
      message: "Payment verified and order created successfully.",
      order,
    });
  } catch (error) {
    console.error("Verify online payment error:", error);

    // Release the claim so a retry is possible after a verification failure.
    // Do not release it for a duplicate-key error: an order may already exist.
    if (claimed && attemptId && error.code !== 11000) {
      try {
        await PaymentAttempt.updateOne(
          {
            _id: attemptId,
            status: "PROCESSING",
          },
          {
            $set: { status: "CREATED" },
          }
        );
      } catch (resetError) {
        console.error(
          "Could not reset payment attempt:",
          resetError
        );
      }
    }

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Payment verification failed. If money was deducted, contact support before retrying.",
    });
  }
};






module.exports = {
  createOrder,
  getMyOrders,
  cancelOrder,
  createOnlinePaymentOrder,
  verifyOnlinePayment,
  getOrderDetails
};