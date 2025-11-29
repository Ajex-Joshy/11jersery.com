import Order from "../../../../models/order.model.js";
import { STATUS_CODES } from "../../../../utils/constants.js";
import { AppError } from "../../../../utils/helpers.js";
import { getSignedUrlForKey } from "../../../admin/service-helpers/s3.service.js";

export const getOrderDetails = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId }).select(
    "  -updatedAt -__v"
  );

  if (!order)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
  // Convert order to object
  const orderObj = order.toObject();

  if (orderObj.items && Array.isArray(orderObj.items)) {
    for (let item of orderObj.items) {
      let imageUrl = await getSignedUrlForKey(item.imageId);
      item.imageUrl = imageUrl;
      delete item.imageId;
    }
  }

  // Include only minimal shipping address fields
  if (orderObj.shippingAddress) {
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      country,
      phoneNumber,
      email,
    } = orderObj.shippingAddress;
    orderObj.shippingAddress = {
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      country,
      phoneNumber,
      email,
    };
  }

  return orderObj;
};
