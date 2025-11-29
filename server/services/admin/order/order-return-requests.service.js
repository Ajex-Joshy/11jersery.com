import { getPagination, getSortOption } from "../../../utils/helpers.js";
import Order from "../../../models/order.model.js";
import createError from "http-errors";
import {
  ensureOrderExists,
  ensureReturnable,
} from "../../user/order/utils/validations.service.js";
import { restoreStock } from "../../user/order/helper-services/stock.service.js";
import Transaction from "../../../models/order-transaction.model.js";
import mongoose from "mongoose";

export const getReturnRequests = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = queryParams;

  const query = {
    $or: [
      { orderStatus: "Return Requested" },
      { "items.status": "Return Requested" },
    ],
  };

  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);

  const [orders, totalRequests] = await Promise.all([
    Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .populate("userId", "firstName lastName email")
      .select("orderId userId items orderStatus createdAt updatedAt payment")
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    requests: orders,
    pagination: {
      totalRequests,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalRequests / pageSize),
      limit: pageSize,
    },
  };
};

export const processOrderReturnRequest = async ({
  orderId,
  action,
  reason,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId);
    ensureOrderExists(order);

    const targetStatus =
      action === "approve" ? "Return Approved" : "Return Rejected";

    if (action === "reject" && !reason) {
      throw createError(400, "Rejection reason is required.");
    }

    for (let item of order.items) {
      ensureReturnable(item);
      item.status = targetStatus;
    }
    if (order.orderStatus === "Return Requested")
      order.orderStatus = targetStatus;

    if (action === "approve") {
      for (const item of order.items) {
        item.timeline.returnApprovedAt = new Date();
        if (item.status === "Return Approved") {
          await restoreStock(session, item.productId, item.size, item.quantity);
        }
      }
      if (order.payment.method === "COD" && order.payment.status === "Paid") {
        order.payment.status = "Refund Initiated";
        const latestTransactionId =
          order.transactionIds[order.transactionIds.length - 1];
        await Transaction.findByIdAndUpdate(
          latestTransactionId,
          { status: "Refunded" },
          { session }
        );
      }

      const [newTransaction] = await Transaction.create(
        [
          {
            orderId: order._id,
            userId: order.userId,
            amount: order.price,
            type: "DEBIT",
            status: "PENDING",
            paymentMethod: "WALLET",
            reason: "ORDER_REFUND",
          },
        ],
        { session }
      );
      order.timeline.returnApprovedAt = new Date();
      order.transactionIds.push(newTransaction._id);
    } else {
      order.returnReason = reason;
      order.timeline.returnRejectedAt = new Date();
      for (let item of order.items) {
        item.timeline.returnRejectedAt = new Date();
      }
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

export const processItemReturnRequest = async ({
  orderId,
  action,
  itemId,
  reason,
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw createError(404, "Order not found");

    const item = order.items.id(itemId);

    if (!item) throw createError(404, "Item not found in order");

    if (item.status !== "Return Requested") {
      throw createError(400, "Item is not in 'Return Requested' status.");
    }

    const targetStatus =
      action === "approve" ? "Return Approved" : "Return Rejected";

    // Reject reason validation
    if (action === "reject" && !reason) {
      throw createError(400, "Rejection reason is required.");
    }

    // Update item status and timeline
    item.status = targetStatus;
    if (action === "approve") {
      item.timeline.returnApprovedAt = new Date();
      await restoreStock(session, item.productId, item.size, item.quantity);
    } else {
      item.returnReason = item.returnReason
        ? `${item.returnReason} | Admin Rejection: ${reason}`
        : `Admin Rejection: ${reason}`;
      item.timeline.returnRejectedAt = new Date();
    }

    if (order.items.every((i) => i.status === targetStatus)) {
      order.orderStatus = targetStatus;
    }

    // Payment & transaction handling (only on approval)
    if (action === "approve") {
      if (order.payment.method === "COD" && order.payment.status === "Paid") {
        order.payment.status = "Refund Initiated";
        if (order.transactionIds?.length) {
          const latestTransactionId =
            order.transactionIds[order.transactionIds.length - 1];
          await Transaction.findByIdAndUpdate(
            latestTransactionId,
            { status: "Refund" },
            { session }
          );
        }
      }

      // Create new transaction for wallet refund
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
    }

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
