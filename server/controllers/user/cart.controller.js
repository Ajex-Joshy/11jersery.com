import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { sendResponse } from "../../utils/helpers.js";

import {
  getCart,
  addItem,
  removeItem,
  clearCart,
  adjustItemQuantity,
} from "../../services/user/cart.services.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getCartController = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  const cart = await getCart(userId);

  sendResponse(res, cart);
});

export const addItemToCartController = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { productId, size, quantity } = req.body;

  if (!productId || !size || !quantity) {
    throw createError(
      STATUS_CODES.BAD_REQUEST,
      "productId, size, and quantity are required."
    );
  }

  const updatedCart = await addItem(userId, { productId, size, quantity });

  sendResponse(res, updatedCart);
});

export const incrementItem = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { itemId } = req.params;

  const cart = await adjustItemQuantity(userId, itemId, "increment");
  res.status(200).json(cart);
});

export const decrementItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  const cart = await adjustItemQuantity(userId, itemId, "decrement");
  res.status(200).json(cart);
});

export const removeItemFromCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  if (!itemId) {
    throw createError(
      STATUS_CODES.BAD_REQUEST,
      "Item ID is required in URL parameters."
    );
  }

  const updatedCart = await removeItem(userId, itemId);

  sendResponse(res, updatedCart);
});

export const clearCartController = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const clearedCart = await clearCart(userId);

  sendResponse(res, clearedCart);
});
