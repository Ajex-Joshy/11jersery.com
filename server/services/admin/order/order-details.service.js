import Order from "../../../models/order.model.js";
import { AppError } from "../../../utils/helpers.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import { getSignedUrlForKey } from "../service-helpers/s3.service.js";

export const getOrderDetails = async (orderId) => {
  const order = await Order.findById(orderId).lean();
  if (!order) {
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  }

  for (let item of order.items) {
    if (item.imageId) {
      item.imageUrl = await getSignedUrlForKey(item.imageId);
    }
  }

  return order;
};
