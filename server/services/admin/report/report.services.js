import Order from "../../../models/order.model.js";
import { getPagination } from "../../../utils/helpers.js";

/**
 * Generates a sales report based on date range and period.
 * @param {object} params - { startDate, endDate, period, page, limit }
 */
export const getSalesReport = async (params) => {
  const {
    startDate,
    endDate,
    period = "daily", // 'daily', 'weekly', 'monthly', 'yearly'
    page = 1,
    limit = 10,
  } = params;

  // 1. Date Filter
  const matchStage = {
    orderStatus: { $in: ["Delivered"] },
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  const { skip, pageNumber, pageSize } = getPagination(page, limit, 50);

  // If no date provided, default to last 30 days? Or all time?
  // Let's assume validation handles required dates or defaults.

  // 2. Grouping Logic
  let dateExpression;
  switch (period) {
    case "daily":
      dateExpression = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
      break;
    case "weekly":
      // Returns year and week number (e.g., "2025-42")
      dateExpression = {
        $concat: [
          { $toString: { $isoWeekYear: "$createdAt" } },
          "-",
          { $toString: { $isoWeek: "$createdAt" } },
        ],
      };
      break;
    case "monthly":
      dateExpression = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
      break;
    case "yearly":
      dateExpression = { $dateToString: { format: "%Y", date: "$createdAt" } };
      break;
    default:
      dateExpression = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
  }
  console.log(period, dateExpression);

  // 3. Aggregation Pipeline
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: dateExpression,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: "$price.total" }, // Assuming structure from order model
        totalDiscount: { $sum: "$price.discount" },
        totalSpecialDiscount: { $sum: "$price.specialDiscount" },
        totalCouponDiscount: { $sum: "$price.couponDiscount" },
        // If coupons are separate from discount field:
        // totalCouponDeduction: { $sum: "$pricing.couponDeduction" }
      },
    },
    { $sort: { _id: -1 } }, // Sort by date descending
  ];

  // 4. Execute Aggregation
  // We need pagination on the aggregated results, which is tricky with standard .find().
  // We use $facet for pagination within aggregation.

  const result = await Order.aggregate([
    ...pipeline,
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: pageSize }],
      },
    },
  ]);
  console.log("result", result);

  const reportData = result[0].data;
  const totalRecords = result[0].metadata[0] ? result[0].metadata[0].total : 0;

  // 5. Calculate Overall Summary (Grand Totals)
  // This requires a separate aggregation without pagination/grouping by date
  // or we can sum up the results if the range is small.
  // For accuracy over large ranges, a separate simple aggregate is better.
  const summary = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        overallSalesCount: { $sum: 1 },
        overallOrderAmount: { $sum: "$price.total" },
        overallDiscount: { $sum: "$price.discount" },
        overallSpecialDiscount: { $sum: "$price.specialDiscount" },
        overallCouponDiscount: { $sum: "$price.couponDiscount" },
        overallReferralBonus: { $sum: "$price.referralBonus" },
      },
    },
  ]);

  const overallStats = summary[0] || {
    overallSalesCount: 0,
    overallOrderAmount: 0,
    overallDiscount: 0,
  };

  return {
    report: reportData,
    summary: overallStats,
    pagination: {
      totalRecords,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalRecords / pageSize),
      limit: pageSize,
    },
  };
};
