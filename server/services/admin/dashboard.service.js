import Order from "../../models/order.model.js";

/**
 * Generates stats for the Admin Dashboard.
 * @returns {Promise<object>} The dashboard data.
 */
export const getDashboardStats = async () => {
  // 1. Date Ranges for Comparison (Progress)
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(startOfCurrentMonth); // Last month ended when current started

  // 2. Top Selling Products (Top 10)
  const bestSellingProducts = await Order.aggregate([
    { $match: { status: { $nin: ["Cancelled", "Returned"] } } }, // Exclude cancelled/returned
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        title: { $first: "$items.title" },
        // image: { $first: "$items.image" }, // Include if you want images
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.salePrice", "$items.quantity"] },
        },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  // 3. Top Selling Categories (Top 10)
  // This is trickier because Order Items usually store product snapshots, not category IDs.
  // We need to lookup the Product to find its Category(s).
  const bestSellingCategories = await Order.aggregate([
    { $match: { status: { $nin: ["Cancelled", "Returned"] } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    { $unwind: "$productInfo.categoryIds" }, // A product can have multiple categories
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.categoryIds",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $group: {
        _id: "$categoryInfo._id",
        name: { $first: "$categoryInfo.title" },
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  // 4. Overall Progress Stats (Current Month vs Last Month)
  const [currentMonthStats, lastMonthStats, totalCounts] = await Promise.all([
    // Current Month
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfCurrentMonth } } },
      {
        $group: {
          _id: null,
          sales: { $sum: 1 }, // Order count
          revenue: { $sum: "$pricing.total" },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
          },
          returned: {
            $sum: { $cond: [{ $eq: ["$status", "Returned"] }, 1, 0] },
          },
        },
      },
    ]),
    // Last Month
    Order.aggregate([
      {
        $match: { createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth } },
      },
      {
        $group: {
          _id: null,
          sales: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
        },
      },
    ]),
    // Totals All Time
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 }, // Total Orders
          totalRevenue: { $sum: "$price.total" },
          totalCancelled: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
          },
          totalReturned: {
            $sum: { $cond: [{ $eq: ["$status", "Returned"] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const current = currentMonthStats[0] || {
    sales: 0,
    revenue: 0,
    cancelled: 0,
    returned: 0,
  };
  const last = lastMonthStats[0] || { sales: 0, revenue: 0 };
  const totals = totalCounts[0] || {
    totalSales: 0,
    totalRevenue: 0,
    totalCancelled: 0,
    totalReturned: 0,
  };

  // Calculate Percentage Growth (Revenue)
  let growthPercentage = 0;
  if (last.revenue > 0) {
    growthPercentage = ((current.revenue - last.revenue) / last.revenue) * 100;
  } else if (current.revenue > 0) {
    growthPercentage = 100; // 100% growth if last month was 0
  }

  return {
    bestSellingProducts,
    bestSellingCategories,
    // bestSellingBrands, // Add similar logic if you have a Brand model
    stats: {
      overview: {
        totalRevenue: totals.totalRevenue,
        totalOrders: totals.totalSales,
        totalCancelled: totals.totalCancelled,
        totalReturned: totals.totalReturned,
      },
      monthly: {
        currentRevenue: current.revenue,
        currentOrders: current.sales,
        growthPercentage: growthPercentage.toFixed(1),
        cancelled: current.cancelled,
        returned: current.returned,
      },
    },
  };
};
