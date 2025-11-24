import {
  placeCodOrder,
  listOrders,
  getOrderDetails,
  cancelOrder,
  cancelItem,
  requestReturnItem,
  requestReturnOrder,
  placeWalletOrder,
} from "../../services/user/order/index.js";
import { STATUS_CODES } from "../../utils/constants.js";
import {
  AppError,
  asyncHandler,
  validateObjectId,
} from "../../utils/helpers.js";
import { sendResponse } from "../../utils/helpers.js";
import { generateInvoice } from "../../services/user/order/generate-invoice.service.js";
// PLACE COD ORDER
export const placeCodOrderController = asyncHandler(async (req, res) => {
  const { shippingAddressId } = req.body;
  validateObjectId(shippingAddressId);
  const userId = req.user._id;

  const order = await placeCodOrder(userId, shippingAddressId);

  return sendResponse(res, order, STATUS_CODES.CREATED);
});

export const placeWalletOrderController = asyncHandler(async (req, res) => {
  const { shippingAddressId } = req.body;
  validateObjectId(shippingAddressId);
  const userId = req.user._id;

  const order = await placeWalletOrder(userId, shippingAddressId);

  return sendResponse(res, order, STATUS_CODES.CREATED);
});

// LIST USER ORDERS
export const listUserOrdersController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await listOrders(userId, req.query);

  return sendResponse(res, {
    ...result,
  });
});

// ORDER DETAILS
export const getOrderDetailsController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await getOrderDetails(userId, orderId);

  return sendResponse(res, order);
});

// // REQUEST ORDER CANCELLATION
export const cancelOrderController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body || "";
  const userId = req.user._id;

  const updated = await cancelOrder(userId, orderId, reason);

  return sendResponse(res, updated);
});

// CANCEL SINGLE ITEM
export const cancelItemController = asyncHandler(async (req, res) => {
  const { orderId, itemId } = req.params; // itemId passed in params or body
  const { reason } = req.body || "";
  const userId = req.user._id;

  const updatedOrder = await cancelItem(userId, orderId, itemId, reason);

  return sendResponse(res, updatedOrder);
});
// REQUEST ORDER RETURN
export const requestOrderReturnController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  if (!reason)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "VALIDATION_ERROR",
      "Could not find reason"
    );
  const userId = req.user._id;

  const updatedOrder = await requestReturnOrder(userId, orderId, reason);

  return sendResponse(res, updatedOrder);
});

// REQUEST ITEM RETURN
export const requestItemReturnController = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const { itemId, orderId } = req.params;
  if (!reason)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "VALIDATION_ERROR",
      "Could not find reason"
    );
  const userId = req.user._id;

  const updatedOrder = await requestReturnItem(userId, orderId, itemId, reason);

  return sendResponse(res, updatedOrder);
});

// GENERATE INVOICE PDF
export const generateInvoiceController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  await generateInvoice(userId, orderId, res);
});

// // SUBMIT PRODUCT REVIEW
// export const submitProductReviewController = asyncHandler(async (req, res) => {
//   const { orderId } = req.params;
//   const { itemId, rating, comment } = req.body;
//   const userId = req.user._id;

//   const result = await submitReview(userId, orderId, itemId, rating, comment);

//   return sendResponse(res, result, STATUS_CODES.CREATED);
// });
