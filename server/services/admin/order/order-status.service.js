import Order from "../../../models/order.model.js";
import { AppError } from "../../../utils/helpers.js";
import { STATUS_CODES } from "../../../utils/constants.js";

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

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

  const timelineMap = {
    Pending: "placedAt",
    Processing: "confirmedAt",
    Shipped: "shippedAt",
    Delivered: "deliveredAt",
  };
  if (timelineMap[status]) {
    order.timeline[timelineMap[status]] = new Date();
  }

  // Sync item statuses
  order.items.forEach((i) => (i.status = status));

  await order.save();
  return order;
};
