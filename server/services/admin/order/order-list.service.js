import Order from "../../../models/order.model.js";
import { getPagination, getSortOption } from "../../../utils/helpers.js";

export const getOrderStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const stats = await Order.aggregate([
    {
      $facet: {
        totalOrders: [{ $count: "count" }],
        newOrders: [
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          { $count: "count" },
        ],
        completedOrders: [
          { $match: { orderStatus: "Delivered" } },
          { $count: "count" },
        ],
        canceledOrders: [
          { $match: { orderStatus: "Cancelled" } },
          { $count: "count" },
        ],
      },
    },
  ]);

  const getCount = (arr) => (arr && arr.length > 0 ? arr[0].count : 0);

  return {
    totalOrders: getCount(stats[0].totalOrders),
    newOrders: getCount(stats[0].newOrders),
    completedOrders: getCount(stats[0].completedOrders),
    canceledOrders: getCount(stats[0].canceledOrders),
  };
};

export const getAllOrders = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const query = {};
  if (status && status !== "All") {
    query.orderStatus = status;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    query.$or = [
      { orderId: searchRegex }, // Search by Order ID (string)
      { "shippingAddress.firstName": searchRegex },
      { "shippingAddress.lastName": searchRegex },
      // If you stored user email/phone in shippingAddress, add those here too
    ];
  }
  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select(
        "orderId shippingAddress.firstName shippingAddress.lastName createdAt price payment.status orderStatus items"
      )
      .lean(), // Use lean() for plain JS objects (faster)
    Order.countDocuments(query),
  ]);

  // 4. Format the response (Optional: Clean up data for frontend)
  const formattedOrders = orders.map((order) => ({
    _id: order._id,
    orderId: order.orderId || order._id.toString().slice(-6).toUpperCase(),
    customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    date: order.createdAt,
    price: order?.price?.total,
    paymentStatus: order.payment.status,
    status: order.orderStatus,
    productName:
      order.items.length > 0 ? order.items[0].title : "Unknown Product",
    itemsCount: order.items.length,
  }));

  return {
    orders: formattedOrders,
    pagination: {
      totalOrders,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalOrders / pageSize),
      limit: pageSize,
    },
  };
};
