import Order from "../../../models/order.model.js";
import { AppError } from "../../../utils/helpers.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import Transaction from "../../../models/order-transaction.model.js";

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

  order.items.forEach((i) => {
    if (
      ["Cancelled", "Return Request", "Return Approved", "Returened"].includes(
        i.status
      )
    )
      return;
    i.status = status;
  });
  if (status === "Delivered") {
    order.payment.status = "Paid";

    if (order.transactionIds?.length) {
      const latestTransactionId =
        order.transactionIds[order.transactionIds.length - 1];
      const transaction = await Transaction.findById(latestTransactionId);
      if (transaction) {
        transaction.status = "SUCCESS";
        await transaction.save();
      }
    }
  }

  await order.save();
  return order;
};
