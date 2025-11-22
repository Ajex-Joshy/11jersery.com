import { asyncHandler } from "../../utils/helpers.js";
import {
  getOrderStats,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getReturnRequests,
} from "../../services/admin/order/index.js";
import { sendResponse } from "../../utils/helpers.js";
import {
  cancelItem,
  cancelOrder,
} from "../../services/user/order/cancel-order.service.js";

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
