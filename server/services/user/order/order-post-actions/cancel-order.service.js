import mongoose from "mongoose";
import Order from "../../../../models/order.model.js";
import { restoreStock } from "../helper-services/stock.service.js";
import {
  ensureOrderExists,
  ensureCancelable,
  ensureItemCancelable,
} from "../utils/validations.service.js";
import { markAsCanceled } from "./item-actions.service.js";
import Transaction from "../../../../models/order-transaction.model.js";
import { recalculatedOrderAmount } from "../refund/item/item-refund.js";
import { creditWallet } from "../../wallet.services.js";
import updateCouponUsage from "../place-order-services/utils/coupon-action.js";

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
    }
    if (order.payment.status === "Paid") {
      await creditWallet(
        session,
        userId,
        order.price.total,
        "Order Refund",
        order.orderId
      );
      const latestTransactionId =
        order.transactionIds[order.transactionIds.length - 1];
      order.payment.status = "Refunded";
      await Transaction.findByIdAndUpdate(
        latestTransactionId,
        { status: "Refunded" },
        { session }
      );
    } else {
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

    if (order.price.couponDiscount > 0) {
      await updateCouponUsage(order.price.couponCode, -1);
    }

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
    const {
      subtotal,
      specialDiscount,
      couponDiscount,
      referralBonus,
      total,
      deliveryFee,
      refundAmount,
    } = await recalculatedOrderAmount(order, item);

    await restoreStock(session, item.productId, item.size, item.quantity);
    markAsCanceled(item, reason);

    order.price.subtotal = subtotal;
    order.price.discount =
      order.price.discount - (item.listPrice - item.salePrice) * item.quantity;
    order.price.deliveryFee = deliveryFee;
    order.price.specialDiscount = specialDiscount;
    order.price.couponDiscount = couponDiscount;
    order.price.referralBonus = referralBonus;
    order.price.total = total + deliveryFee;

    if (order.payment.status === "Paid") {
      await creditWallet(
        session,
        userId,
        refundAmount,
        "Order Refund",
        order.orderId
      );
    }
    const [newTransaction] = await Transaction.create(
      [
        {
          orderId: order._id,
          userId: order.userId,
          amount: order.price,
          type: "CREDIT",
          status: order.payment.status === "Paid" ? "REFUNDED" : "UNPAID",
          paymentMethod: order.payment.method,
          reason: "RECALCULATED_ORDER_PAYMENT",
        },
      ],
      { session }
    );

    order.transactionIds.push(newTransaction._id);
    const paymentStatus =
      order.payment.status === "Paid" ? "Refunded" : "Unpaid";
    const allCancelled = order.items.every((i) => i.status === "Cancelled");
    if (allCancelled) {
      order.orderStatus = "Cancelled";
      let firstTransaction = await Transaction.findById(
        order.transactionIds[0]
      );
      order.price = firstTransaction.amount;
      order.payment.status = paymentStatus;
      await Transaction.findByIdAndUpdate(
        newTransaction._id,
        { status: paymentStatus },
        { session }
      );
      if (order.price.couponDiscount > 0) {
        await updateCouponUsage(priceData.couponCode, -1);
      }
    }

    order.markModified("price");
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
