import mongoose from "mongoose";
import Order from "../../../models/order.model.js";
import {
  ensureOrderExists,
  ensureItemExists,
  ensureReturnable,
} from "./validations.service.js";
import { requestItemReturn } from "./item-actions.service.js";

export const requestReturnOrder = async (userId, orderId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      userId,
    }).session(session);

    ensureOrderExists(order);

    order.items.forEach((item) => {
      ensureReturnable(item);
      requestItemReturn(item, reason);
    });

    if (order.items.every((item) => item.status === "Return Requested")) {
      order.orderStatus = "Return Requested";
    } else {
      order.orderStatus = order.orderStatus;
    }

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

export const requestReturnItem = async (userId, orderId, itemId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let order;

    if (orderId) {
      order = await Order.findOne({ _id: orderId, userId }).session(session);
    } else {
      order = await Order.findOne({
        userId,
        "items._id": itemId,
      }).session(session);
    }

    ensureOrderExists(order);

    const item = order.items.id(itemId);
    ensureItemExists(item);
    ensureReturnable(item);

    requestItemReturn(item, reason);

    if (order.items.every((i) => i.status === "Return Requested")) {
      order.orderStatus = "Return Requested";
    }

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
