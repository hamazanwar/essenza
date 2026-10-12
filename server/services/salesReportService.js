
const Order = require("../models/Order");

const getSalesReportService = async (from, to) => {
  const dateFilter = {};

  if (from || to) {
    dateFilter.createdAt = {};

    if (from) {
      const startDate = new Date(`${from}T00:00:00.000`);
      if (Number.isNaN(startDate.getTime())) {
        throw new Error("Invalid start date.");
      }
      dateFilter.createdAt.$gte = startDate;
    }

    if (to) {
      const endDate = new Date(`${to}T23:59:59.999`);
      if (Number.isNaN(endDate.getTime())) {
        throw new Error("Invalid end date.");
      }
      dateFilter.createdAt.$lte = endDate;
    }

    if (from && to && from > to) {
      throw new Error("Start date cannot be after end date.");
    }
  }

  const orders = await Order.find(dateFilter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Only delivered orders count as completed sales.
  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "DELIVERED"
  );

  const totalSales = deliveredOrders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0
  );

  const totalOrders = orders.length;

  const deliveredOrderCount = deliveredOrders.length;

  const averageOrderValue =
    deliveredOrderCount > 0
      ? totalSales / deliveredOrderCount
      : 0;

  // Group delivered sales by order creation date.
  const dailySalesMap = {};

  deliveredOrders.forEach((order) => {
    const date = new Date(order.createdAt)
      .toISOString()
      .slice(0, 10);

    if (!dailySalesMap[date]) {
      dailySalesMap[date] = {
        date,
        sales: 0,
        orders: 0,
      };
    }

    dailySalesMap[date].sales +=
      Number(order.totalAmount) || 0;

    dailySalesMap[date].orders += 1;
  });

  const dailySales = Object.values(dailySalesMap).sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  return {
    summary: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      deliveredOrders: deliveredOrderCount,
      averageOrderValue:
        Math.round(averageOrderValue * 100) / 100,
    },
    dailySales,
    orders,
  };
};

module.exports = {
  getSalesReportService,
};
