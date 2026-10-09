const Order = require("../models/Order");
const Address = require("../models/Address");
const Product = require("../models/product");
const Variant = require("../models/variant");

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

  // Check address belongs to the logged-in user
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
    if (!item.productId || !item.variantId || !item.quantity) {
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

    if (!variant) {
      throw new Error(
        `Variant for ${product.name} is no longer available.`
      );
    }

    if (variant.stock < item.quantity) {
      throw new Error(
        `${product.name} has only ${variant.stock} item(s) available.`
      );
    }

    const totalPrice = variant.price * item.quantity;

    subtotal += totalPrice;

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      productName: product.name,
      size: variant.size,
      productImage: product.productImage?.[0] || "",
      price: variant.price,
      quantity: item.quantity,
      totalPrice,
    });
  }

  const deliveryCharge = 0;
  const totalAmount = subtotal + deliveryCharge;

  const order = await Order.create({
    userId,
    addressId,
    items: orderItems,
    subtotal,
    deliveryCharge,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
    orderStatus: "PENDING",
  });

  // Reduce stock after creating the order
  for (const item of items) {
    await Variant.findByIdAndUpdate(
      item.variantId,
      {
        $inc: {
          stock: -item.quantity,
        },
      }
    );
  }

  return order;
};


const createPaidOnlineOrderService = async ({
  userId,
  addressId,
  items,
  razorpayPaymentId,
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

    const totalPrice = variant.price * quantity;
    subtotal += totalPrice;

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      productName: product.name,
      size: variant.size,
      productImage: product.productImage?.[0] || "",
      price: variant.price,
      quantity,
      totalPrice,
    });
  }

  const deliveryCharge = 0;
  const totalAmount = subtotal + deliveryCharge;

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


const getMyOrdersService = async (userId) => {
  const orders = await Order.find({ userId })
    .populate("addressId")
    .sort({ createdAt: -1 });

  return orders;
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
  createPaidOnlineOrderService
};