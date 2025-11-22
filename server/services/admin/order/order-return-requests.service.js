import Order from "../../../models/order.model.js";

export const getReturnRequests = async () => {
  return await Order.find({
    items: { $elemMatch: { returnRequest: { $exists: true } } },
  })
    .sort({ createdAt: -1 })
    .lean();
};
