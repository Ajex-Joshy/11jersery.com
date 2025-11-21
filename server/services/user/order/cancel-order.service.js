import mongoose from "mongoose";
import Order from "../../../models/order.model.js";
import { restoreStock } from "./stock.service.js";
import {
  ensureOrderExists,
  ensureCancelable,
  ensureItemCancelable,
} from "./validations.service.js";
import { markAsCanceled } from "./item-actions.service.js";

export const cancelOrder = async (userId, orderId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(
      session
    );

    ensureOrderExists(order);
    ensureCancelable(order);

    // Restore stock and cancel each item
    for (const item of order.items) {
      await restoreStock(session, item.productId, item.size, item.quantity);
      markAsCanceled(item, reason);
    }

    order.orderStatus = "Cancelled";
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const cancelItem = async (userId, orderId, itemId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ "items._id": itemId, userId }).session(
      session
    );
    console.log(itemId, userId, order);
    ensureOrderExists(order);
    const item = order.items.id(itemId);
    ensureItemCancelable(item);

    await restoreStock(session, item.productId, item.size, item.quantity);
    markAsCanceled(item, reason);

    const allCancelled = order.items.every((i) => i.status === "Cancelled");
    if (allCancelled) order.orderStatus = "Cancelled";

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
