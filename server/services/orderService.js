const Order = require("../models/Order");
const Address = require("../models/Address");
const Product = require("../models/product");
const Variant = require("../models/variant");
const Offer = require("../models/Offer");
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");


const createOrderService = async ({
  userId,
  addressId,
  items,
  paymentMethod,
}) => {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  if (!addressId) {
    throw new Error("Delivery address is required.");
  }

  if (!items || items.length === 0) {
    throw new Error("Order must contain at least one product.");
  }

  if (!["COD", "ONLINE"].includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  const address = await Address.findOne({
    _id: addressId,
    userId,
  });

  if (!address) {
    throw new Error("Delivery address not found.");
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    if (
      !item.productId ||
      !item.variantId ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1
    ) {
      throw new Error("Invalid order item.");
    }

    const quantity = Number(item.quantity);

    const product = await Product.findOne({
      _id: item.productId,
      isActive: true,
    });

    if (!product) {
      throw new Error("One of the products is no longer available.");
    }

    const variant = await Variant.findOne({
      _id: item.variantId,
      productId: item.productId,
    });

    if (!variant) {
      throw new Error(
        `Variant for ${product.name} is no longer available.`
      );
    }

    if (variant.stock < quantity) {
      throw new Error(
        `${product.name} has only ${variant.stock} item(s) available.`
      );
    }

    const originalPrice = Number(variant.price);
    let unitPrice = originalPrice;
    let offerId = null;

    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gt: now },
      $or: [
        { applicableProducts: product._id },
        { applicableCategories: product.categoryId },
      ],
    });

    for (const offer of offers) {
      const offerPrice =
        offer.discountType === "PERCENTAGE"
          ? originalPrice * (1 - offer.discountValue / 100)
          : Math.max(0, originalPrice - offer.discountValue);

      const roundedOfferPrice =
        Math.round(offerPrice * 100) / 100;

      if (roundedOfferPrice < unitPrice) {
        unitPrice = roundedOfferPrice;
        offerId = offer._id;
      }
    }

    const discountAmount =
      Math.round((originalPrice - unitPrice) * 100) / 100;

    const totalPrice =
      Math.round(unitPrice * quantity * 100) / 100;

    subtotal += totalPrice;

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      productName: product.name,
      size: variant.size,
      productImage: product.productImage?.[0] || "",
      price: unitPrice,
      originalPrice,
      discountAmount,
      offerId,
      quantity,
      totalPrice,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;

  const deliveryCharge = 0;
  const totalAmount =
    Math.round((subtotal + deliveryCharge) * 100) / 100;

  const order = await Order.create({
    userId,
    addressId,
    items: orderItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    paymentMethod,
    paymentStatus: "PENDING",
    orderStatus: "PENDING",
  });

  for (const item of orderItems) {
    await Variant.findByIdAndUpdate(item.variantId, {
      $inc: { stock: -item.quantity },
    });
  }

  return order;
};



const createPaidOnlineOrderService = async ({
  userId,
  addressId,
  items,
  razorpayPaymentId,
  expectedAmount,
}) => {
  if (!userId || !addressId || !razorpayPaymentId) {
    throw new Error("Required payment details are missing.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one product.");
  }

  const address = await Address.findOne({
    _id: addressId,
    userId,
  });

  if (!address) {
    throw new Error("Delivery address not found.");
  }

  // Prevent reusing a payment ID to create another order.
  const existingOrder = await Order.findOne({
    paymentId: razorpayPaymentId,
  });

  if (existingOrder) {
    if (existingOrder.userId.toString() !== userId.toString()) {
      throw new Error("This payment has already been used.");
    }

    return existingOrder;
  }

  const orderItems = [];
  let subtotal = 0;

  // Validate all items before reducing stock.
  for (const item of items) {
    const quantity = Number(item.quantity);

    if (
      !item.productId ||
      !item.variantId ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error("Invalid order item.");
    }

    const product = await Product.findOne({
      _id: item.productId,
      isActive: true,
    });

    if (!product) {
      throw new Error("One of the products is no longer available.");
    }

    const variant = await Variant.findOne({
      _id: item.variantId,
      productId: item.productId,
    });

    if (!variant || variant.stock < quantity) {
      throw new Error(
        `${product.name} is unavailable in the requested quantity.`
      );
    }

    
const originalPrice = Number(item.originalPrice ?? variant.price);
const unitPrice = Number(item.unitPrice ?? variant.price);

if (
  !Number.isFinite(originalPrice) ||
  !Number.isFinite(unitPrice) ||
  originalPrice !== variant.price ||
  unitPrice < 0 ||
  unitPrice > originalPrice
) {
  throw new Error("Invalid saved product pricing.");
}

const totalPrice = Math.round(unitPrice * 100 * quantity) / 100;
subtotal += totalPrice;

orderItems.push({
  productId: product._id,
  variantId: variant._id,
  productName: product.name,
  size: variant.size,
  productImage: product.productImage?.[0] || "",
  price: unitPrice,
  originalPrice,
  discountAmount: Math.round((originalPrice - unitPrice) * 100) / 100,
  offerId: item.offerId || null,
  quantity,
  totalPrice,
});

  }

  const deliveryCharge = 0;

subtotal = Math.round(subtotal * 100) / 100;

const totalAmount = Math.round(
  (subtotal + deliveryCharge) * 100
) / 100;

if (
  !Number.isSafeInteger(expectedAmount) ||
  Math.round(totalAmount * 100) !== expectedAmount
) {
  throw new Error(
    "Order total does not match the verified payment amount."
  );
}

  // Atomically reserve each item's stock.
  const reservedItems = [];

  try {
    for (const item of orderItems) {
      const reservedVariant = await Variant.findOneAndUpdate(
        {
          _id: item.variantId,
          productId: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        { new: true }
      );

      if (!reservedVariant) {
        throw new Error(
          `${item.productName} is no longer available in the requested quantity.`
        );
      }

      reservedItems.push(item);
    }

    const order = await Order.create({
      userId,
      addressId,
      items: orderItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      paymentId: razorpayPaymentId,
      orderStatus: "PENDING",
    });

    return order;
  } catch (error) {
    // Restore stock if order creation fails.
    for (const item of reservedItems) {
      await Variant.findByIdAndUpdate(item.variantId, {
        $inc: { stock: item.quantity },
      });
    }

    throw error;
  }
};

const createWalletOrderService = async ({
  userId,
  addressId,
  items,
}) => {
  if (!userId || !addressId) {
    throw new Error("User and delivery address are required.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one product.");
  }

  const session = await mongoose.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const address = await Address.findOne({
        _id: addressId,
        userId,
      }).session(session);

      if (!address) {
        throw new Error("Delivery address not found.");
      }

      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const quantity = Number(item.quantity);

        if (
          !item.productId ||
          !item.variantId ||
          !Number.isSafeInteger(quantity) ||
          quantity < 1
        ) {
          throw new Error("Invalid order item.");
        }

        const product = await Product.findOne({
          _id: item.productId,
          isActive: true,
        }).session(session);

        if (!product) {
          throw new Error("A product is no longer available.");
        }

        const variant = await Variant.findOne({
          _id: item.variantId,
          productId: item.productId,
        }).session(session);

        if (!variant || variant.stock < quantity) {
          throw new Error(
            `${product.name} is unavailable in the requested quantity.`
          );
        }

        const originalPrice = Number(variant.price);
        let unitPrice = originalPrice;
        let offerId = null;

        const now = new Date();

        const offers = await Offer.find({
          isActive: true,
          startDate: { $lte: now },
          endDate: { $gt: now },
          $or: [
            { applicableProducts: product._id },
            { applicableCategories: product.categoryId },
          ],
        }).session(session);

        for (const offer of offers) {
          const offerPrice =
            offer.discountType === "PERCENTAGE"
              ? originalPrice * (1 - offer.discountValue / 100)
              : Math.max(0, originalPrice - offer.discountValue);

          const roundedPrice = Math.round(offerPrice * 100) / 100;

          if (roundedPrice < unitPrice) {
            unitPrice = roundedPrice;
            offerId = offer._id;
          }
        }

        const discountAmount =
          Math.round((originalPrice - unitPrice) * 100) / 100;
        const totalPrice =
          Math.round(unitPrice * quantity * 100) / 100;

        subtotal += totalPrice;

        orderItems.push({
          productId: product._id,
          variantId: variant._id,
          productName: product.name,
          size: variant.size,
          productImage: product.productImage?.[0] || "",
          price: unitPrice,
          originalPrice,
          discountAmount,
          offerId,
          quantity,
          totalPrice,
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;

      const deliveryCharge = 0;
      const totalAmount =
        Math.round((subtotal + deliveryCharge) * 100) / 100;

      const wallet = await Wallet.findOne({
        userId,
        isActive: true,
      }).session(session);

      if (!wallet) {
        throw new Error("Active wallet not found.");
      }

      const availableBalance =
        wallet.balance - (wallet.reservedBalance || 0);

      if (availableBalance < totalAmount) {
        throw new Error("Insufficient available wallet balance.");
      }

      const updatedWallet = await Wallet.findOneAndUpdate(
        {
          _id: wallet._id,
          isActive: true,
          $expr: {
            $gte: [
              {
                $subtract: [
                  "$balance",
                  { $ifNull: ["$reservedBalance", 0] },
                ],
              },
              totalAmount,
            ],
          },
        },
        {
          $inc: {
            balance: -totalAmount,
          },
        },
        {
          session,
          returnDocument: "after",
          runValidators: true,
        }
      );

      if (!updatedWallet) {
        throw new Error("Insufficient available wallet balance.");
      }

      // Reduce stock atomically.
      for (const item of orderItems) {
        const updatedVariant = await Variant.findOneAndUpdate(
          {
            _id: item.variantId,
            productId: item.productId,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            session,
            returnDocument: "after",
          }
        );

        if (!updatedVariant) {
          throw new Error(
            `${item.productName} is no longer available in the requested quantity.`
          );
        }
      }

      const orders = await Order.create(
        [
          {
            userId,
            addressId,
            items: orderItems,
            subtotal,
            deliveryCharge,
            totalAmount,
            paymentMethod: "WALLET",
            paymentStatus: "PAID",
            orderStatus: "PENDING",
          },
        ],
        { session }
      );

      const order = orders[0];

      await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type: "DEBIT",
            source: "ORDER_PAYMENT",
            amount: totalAmount,
            balanceBefore: wallet.balance,
            balanceAfter: updatedWallet.balance,
            orderId: order._id,
            referenceId: `wallet_order_${order._id}`,
            status: "SUCCESS",
            description: `Wallet payment for order ${order._id}`,
          },
        ],
        { session }
      );

      createdOrder = order;
    });

    return createdOrder;
  } finally {
    await session.endSession();
  }
};


const getMyOrdersService = async (userId) => {
  const orders = await Order.find({ userId })
    .populate("addressId")
    .sort({ createdAt: -1 });

  return orders;
};


const getOrderDetailsService = async (userId, orderId) => {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  // Find only an order belonging to the logged-in user.
  const order = await Order.findOne({
    _id: orderId,
    userId,
  }).populate("addressId");

  return order;
};


const cancelOrderService = async (userId, orderId) => {
  if (!userId) {
    throw new Error("User authentication is required.");
  }

  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  // Find the order belonging to the logged-in user
  const order = await Order.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  // Only pending orders can be cancelled
  if (order.orderStatus !== "PENDING") {
    throw new Error(
      "This order cannot be cancelled."
    );
  }

  // Restore stock for every item in the order
  for (const item of order.items) {
    await Variant.findByIdAndUpdate(
      item.variantId,
      {
        $inc: {
          stock: item.quantity,
        },
      }
    );
  }

  // Update order status
  order.orderStatus = "CANCELLED";
  order.cancelledAt = new Date();

  await order.save();

  return order;
};

module.exports = {
  createOrderService,
  getMyOrdersService,
  cancelOrderService,
  createPaidOnlineOrderService,
  getOrderDetailsService,
  createWalletOrderService
};