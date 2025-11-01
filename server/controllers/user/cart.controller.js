import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { sendResponse } from "../../utils/helpers.js";

import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  mergeCart,
  clearCart,
} from "../../services/user/cart.services.js";

export const getCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await getCart(userId);

  sendResponse(res, cart);
});

export const addItemToCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, size, quantity } = req.body;

  if (!productId || !size || !quantity) {
    throw createError(400, "productId, size, and quantity are required.");
  }

  const updatedCart = await addItem(userId, { productId, size, quantity });

  sendResponse(res, updatedCart);
});

export const updateItemQuantityController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!itemId) {
    throw createError(400, "Item ID is required in URL parameters.");
  }
  if (!quantity || quantity <= 0) {
    throw createError(400, "A valid quantity (greater than 0) is required.");
  }

  const updatedCart = await updateItemQuantity(userId, itemId, quantity);

  sendResponse(res, updatedCart);
});

export const removeItemFromCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  if (!itemId) {
    throw createError(400, "Item ID is required in URL parameters.");
  }

  const updatedCart = await removeItem(userId, itemId);

  sendResponse(res, updatedCart);
});

export const mergeCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    throw createError(400, "An 'items' array is required.");
  }

  const mergedCart = await mergeCart(userId, items);

  sendResponse(res, mergedCart);
});

export const clearCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const clearedCart = await clearCart(userId);

  sendResponse(res, clearedCart);
});
