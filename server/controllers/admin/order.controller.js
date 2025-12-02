import { AppError, asyncHandler } from "../../utils/helpers.js";
import {
  getOrderStats,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getReturnRequests,
  processOrderReturnRequest,
  processItemReturnRequest,
} from "../../services/admin/order/index.js";
import { sendResponse } from "../../utils/helpers.js";
import {
  cancelItem,
  cancelOrder,
} from "../../services/user/order/order-post-actions/cancel-order.service.js";
import { STATUS_CODES } from "../../utils/constants.js";
import {
  processOrderReceived,
  processItemReceived,
} from "../../services/admin/order/confirm-return.service.js";

export const getOrdersController = asyncHandler(async (req, res) => {
  const [ordersData, statsData] = await Promise.all([
    getAllOrders(req.query),
    getOrderStats(),
  ]);

  sendResponse(res, {
    ...ordersData,
    stats: statsData,
  });
});

export const getOrderDetailsController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await getOrderDetails(orderId);
  sendResponse(res, { order });
});

export const updateOrderStatusController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await updateOrderStatus(orderId, status);
  sendResponse(res, {
    order,
  });
});

export const cancelOrderController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { userId, reason } = req.body;
  const updatedReason = `${reason} : cancelled by admin`;
  const order = await cancelOrder(userId, orderId, updatedReason);
  sendResponse(res, {
    order,
  });
});

export const cancelOrderItemController = asyncHandler(async (req, res) => {
  const { orderId, itemId } = req.params;
  const { userId, reason } = req.body;
  const updatedReason = `${reason} : cancelled by admin`;
  const order = await cancelItem(userId, orderId, itemId, updatedReason);
  sendResponse(res, {
    order,
  });
});

export const getReturnRequestsController = asyncHandler(async (req, res) => {
  const result = await getReturnRequests(req.query);
  sendResponse(res, { ...result });
});

export const processOrderReturnController = asyncHandler(async (req, res) => {
  const { orderId, action } = req.params;
  const { reason } = req.body || "";
  if (action !== "approve" && action !== "reject")
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      " VALIDATION_ERROR",
      "Invalid action"
    );
  const result = await processOrderReturnRequest({ orderId, action, reason });

  sendResponse(res, { ...result });
});

export const processItemReturnController = asyncHandler(async (req, res) => {
  const { orderId, itemId, action } = req.params;
  const { reason } = req.body || "";
  if (action !== "approve" && action !== "reject")
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      " VALIDATION_ERROR",
      "Invalid action"
    );
  const result = await processItemReturnRequest({
    orderId,
    action,
    reason,
    itemId,
  });
  sendResponse(res, { ...result });
});

export const processOrderReceivedController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const result = await processOrderReceived({ orderId });

  sendResponse(res, { ...result });
});

export const processItemRecievedController = asyncHandler(async (req, res) => {
  const { orderId, itemId } = req.params;
  const result = await processItemReceived({
    orderId,
    itemId,
  });
  sendResponse(res, { ...result });
});
