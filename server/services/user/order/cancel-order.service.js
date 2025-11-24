import mongoose from "mongoose";
import Order from "../../../models/order.model.js";
import { restoreStock } from "./stock.service.js";
import {
  ensureOrderExists,
  ensureCancelable,
  ensureItemCancelable,
} from "./validations.service.js";
import { markAsCanceled } from "./item-actions.service.js";
import Transaction from "../../../models/order-transaction.model.js";

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
    if (order.payment.method === "COD" && order.payment.status === "Pending") {
      order.payment.status = "Unpaid";
      const latestTransactionId =
        order.transactionIds[order.transactionIds.length - 1];
      await Transaction.findByIdAndUpdate(
        latestTransactionId,
        { status: "Unpaid" },
        { session }
      );
    }
    order.orderStatus = "Cancelled";
    let firstTransaction = await Transaction.findById(order.transactionIds[0]);
    order.price = firstTransaction.amount;
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
    ensureOrderExists(order);
    const item = order.items.id(itemId);
    ensureItemCancelable(item);

    await restoreStock(session, item.productId, item.size, item.quantity);
    markAsCanceled(item, reason);

    if (order.payment.method === "COD" && order.payment.status === "Pending") {
      const latestTransactionId =
        order.transactionIds[order.transactionIds.length - 1];
      await Transaction.findByIdAndUpdate(
        latestTransactionId,
        { status: "CANCELLED" },
        { session }
      );

      let price = order.price;
      price.subtotal -= item.listPrice * item.quantity;
      price.discountedPrice -= item.salePrice * item.quantity;
      price.deliveryFee = price.discountedPrice < 500 ? 80 : 0;
      price.total = price.discountedPrice + price.deliveryFee;

      order.price = price;

      const [newTransaction] = await Transaction.create(
        [
          {
            orderId: order._id,
            userId: order.userId,
            amount: price,
            type: "CREDIT",
            status: "PENDING",
            paymentMethod: "COD",
            reason: "RECALCULATED_ORDER_PAYMENT",
          },
        ],
        { session }
      );

      order.transactionIds.push(newTransaction._id);

      const allCancelled = order.items.every((i) => i.status === "Cancelled");
      if (allCancelled) {
        order.orderStatus = "Cancelled";
        let firstTransaction = await Transaction.findById(
          order.transactionIds[0]
        );
        order.price = firstTransaction.amount;
        order.payment.status = "Unpaid";
        await Transaction.findByIdAndUpdate(
          newTransaction._id,
          { status: "Unpaid" },
          { session }
        );
      }
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
