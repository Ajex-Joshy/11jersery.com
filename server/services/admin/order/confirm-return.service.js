import Order from "../../../models/order.model.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import { AppError } from "../../../utils/helpers.js";
import { restoreStock } from "../../user/order/helper-services/stock.service.js";
import {
  ensureOrderExists,
  ensureReturnApproved,
} from "../../user/order/utils/validations.service.js";
import Transaction from "../../../models/order-transaction.model.js";
import { creditWallet } from "../../user/wallet.services.js";
import { recalculatedOrderAmount } from "../../user/order/refund/item/item-refund.js";
import mongoose from "mongoose";
import updateCouponUsage from "../../user/order/place-order-services/utils/coupon-action.js";

export const processOrderReceived = async ({ orderId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId);
    ensureOrderExists(order);
    if (order.payment.status !== "Paid")
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "PAYMENT_ERROR",
        "Payment not completed"
      );

    for (let item of order.items) {
      ensureReturnApproved(item);
      item.status = "Returned";
      item.timeline.returneddAt = new Date();
      await restoreStock(session, item.productId, item.size, item.quantity);
    }
    const latestTransactionId =
      order.transactionIds[order.transactionIds.length - 1];
    await Transaction.findByIdAndUpdate(
      latestTransactionId,
      { status: "Refunded" },
      { session }
    );

    await creditWallet(
      session,
      order.userId,
      order.price.total,
      "Order Refund",
      order.orderId
    );
    order.payment.status = "Refunded";
    order.orderStatus = "Returned";

    const [newTransaction] = await Transaction.create(
      [
        {
          orderId: order._id,
          userId: order.userId,
          amount: order.price,
          type: "DEBIT",
          status: "SUCCESS",
          paymentMethod: order.payment.method,
          reason: "ORDER_REFUND",
        },
      ],
      { session }
    );

    let firstTransaction = await Transaction.findById(order.transactionIds[0]);
    order.price = firstTransaction.amount;

    order.timeline.returnApprovedAt = new Date();
    order.transactionIds.push(newTransaction._id);
    if (order.price.couponDiscount > 0) {
      await updateCouponUsage(priceData.couponCode, -1);
    }

    await order.save();
    await session.commitTransaction();
    session.endSession();
    return order.toObject();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const processItemReceived = async ({ orderId, itemId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw createError(404, "Order not found");

    const item = order.items.id(itemId);

    if (!item) throw createError(404, "Item not found in order");

    ensureReturnApproved(item);

    // Update item status and timeline
    item.status = "Returned";
    item.timeline.returnApprovedAt = new Date();
    await restoreStock(session, item.productId, item.size, item.quantity);

    const {
      subtotal,
      specialDiscount,
      couponDiscount,
      referralBonus,
      total,
      deliveryFee,
      refundAmount,
    } = await recalculatedOrderAmount(order, item);

    order.price.subtotal = subtotal;
    order.price.discount =
      order.price.discount - (item.listPrice - item.salePrice) * item.quantity;
    order.price.deliveryFee = deliveryFee;
    order.price.specialDiscount = specialDiscount;
    order.price.couponDiscount = couponDiscount;
    order.price.referralBonus = referralBonus;
    order.price.total = total + deliveryFee;

    await creditWallet(
      session,
      order.userId,
      refundAmount,
      "Order Refund",
      order.orderId
    );
    const latestTransactionId =
      order.transactionIds[order.transactionIds.length - 1];
    await Transaction.findByIdAndUpdate(
      latestTransactionId,
      { status: "Refund" },
      { session }
    );

    const [newTransaction] = await Transaction.create(
      [
        {
          orderId: order._id,
          userId: order.userId,
          amount: order.price,
          type: "DEBIT",
          status: "PENDING",
          paymentMethod: "WALLET",
          reason: "ORDER_REFUND_ITEM",
        },
      ],
      { session }
    );
    if (!order.transactionIds) order.transactionIds = [];
    order.transactionIds.push(newTransaction._id);

    const allReturned = order.items.every((i) => i.status === "Returned");
    if (allReturned) {
      order.orderStatus = "Returned";
      let firstTransaction = await Transaction.findById(
        order.transactionIds[0]
      );
      order.price = firstTransaction.amount;
      order.payment.status = "Refunded";
      await Transaction.findByIdAndUpdate(
        newTransaction._id,
        { status: "Refunded" },
        { session }
      );
      if (order.price.couponDiscount > 0) {
        await updateCouponUsage(order.price .couponCode, -1);
      }
    }

    order.markModified("price");
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return order.toObject();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
