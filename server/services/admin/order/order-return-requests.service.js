import { getPagination, getSortOption } from "../../../utils/helpers.js";
import Order from "../../../models/order.model.js";
import createError from "http-errors";
import {
  ensureApproveReturnable,
  ensureOrderExists,
} from "../../user/order/utils/validations.service.js";

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
  try {
    const order = await Order.findById(orderId);
    ensureOrderExists(order);

    const targetStatus =
      action === "approve" ? "Return Approved" : "Return Rejected";

    if (action === "reject" && !reason) {
      throw createError(400, "Rejection reason is required.");
    }

    for (let item of order.items) {
      ensureApproveReturnable(item);
      item.status = targetStatus;
    }
    order.orderStatus = targetStatus;

    if (order.orderStatus === "Return Rejected") {
      order.returnReason = reason;
      order.timeline.returnRejectedAt = new Date();
      for (let item of order.items) {
        item.timeline.returnRejectedAt = new Date();
      }
    }

    await order.save();
    return order.toObject();
  } catch (error) {
    throw error;
  }
};

export const processItemReturnRequest = async ({
  session,
  orderId,
  action,
  itemId,
  reason,
}) => {
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
    } else {
      item.returnReason = item.returnReason
        ? `${item.returnReason} | Admin Rejection: ${reason}`
        : `Admin Rejection: ${reason}`;
      item.timeline.returnRejectedAt = new Date();
    }

    if (order.items.every((i) => i.status === targetStatus)) {
      order.orderStatus = targetStatus;
    }
    await order.save({ session });

    return order.toObject();
  } catch (error) {
    throw error;
  }
};
