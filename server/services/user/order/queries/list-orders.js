import { getPagination } from "../../../../utils/helpers.js";
import Order from "../../../../models/order.model.js";
import { getSignedUrlForKey } from "../../../admin/service-helpers/s3.service.js";

export const listOrders = async (userId, queryParams) => {
  const {
    page = 1,
    limit = 5, // Orders are large, so smaller default limit is better
    search = "",
    status = "", // "Pending", "Delivered", etc.
    sortBy = "createdAt",
    sortOrder = "desc",
    timeRange = "", // "last-30-days", "2023", etc. (Optional feature)
  } = queryParams;

  // 1. Build Query
  const query = { userId };

  // Status Filter
  if (status && status !== "All") {
    query.orderStatus = status;
  }

  // Search (Search by Order ID OR Product Title inside items)
  if (search) {
    query.$or = [
      { orderId: { $regex: search, $options: "i" } }, // Matches ORD-123...
      { "items.title": { $regex: search, $options: "i" } }, // Matches product name
    ];
  }

  // Time Range Filter (Optional but professional)
  if (timeRange === "last-30-days") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    query.createdAt = { $gte: d };
  }

  // 2. Pagination & Sort
  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // 3. Execute Queries in Parallel
  const [orders, totalCount] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select("orderId orderStatus payment price items timeline createdAt")
      .lean(),
    Order.countDocuments(query),
  ]);
  for (let order of orders) {
    for (let item of order.items) {
      let imageUrl = await getSignedUrlForKey(item.imageId);
      item.imageUrl = imageUrl;
      delete item.imageId;
    }
  }

  // 4. Return Standardized Response
  return {
    orders,
    metadata: {
      pagination: {
        totalOrders: totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        limit: pageSize,
      },
      // You could also return aggregated stats here (e.g., "2 Orders in Progress")
    },
  };
};
