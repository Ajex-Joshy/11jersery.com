import Order from "../../models/order.model.js";
import { AppError, getPagination, getSortOption } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { getSignedUrlForKey } from "./service-helpers/s3.service.js";

export const getOrderDetails = async (orderId) => {
  const order = await Order.findById(orderId).lean();
  for (let item of order.items) {
    let imageUrl = await getSignedUrlForKey(item.imageId);
    item.imageUrl = imageUrl;
    delete item.imageId;
  }

  if (!order) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }
  return order;
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");

  // Validate status transition (prevent backward or invalid transitions)
  const validTransitions = {
    Pending: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
    Returned: [],
  };

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STATUS_TRANSITION",
      `Cannot move order from ${order.orderStatus} to ${status}`
    );
  }

  order.orderStatus = status;

  // If status is 'Delivered' or 'Cancelled', update timeline
  if (status === "Delivered") order.timeline.deliveredAt = new Date();
  if (status === "Cancelled") order.timeline.cancelledAt = new Date();
  if (status === "Shipped") order.timeline.shippedAt = new Date();

  // Sync all item statuses with the master order status
  order.items.forEach((item) => {
    // Only update items that are not already in a final state
    if (!["Delivered", "Cancelled", "Returned"].includes(item.status)) {
      item.status = status;
    }
  });

  await order.save();
  return order;
};

export const getReturnRequests = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = queryParams;

  const query = {
    $or: [
      { orderStatus: "Return Requested" },
      { "items.status": "Return Requested" },
    ],
  };

  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);

  const [orders, totalRequests] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select(
        "orderId userId shippingAddress items orderStatus createdAt updatedAt"
      )
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    requests: orders,
    pagination: {
      totalRequests,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalRequests / pageSize),
      limit: pageSize,
    },
  };
};
