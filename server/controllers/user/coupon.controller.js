import createHttpError from "http-errors";
import {
  applyCoupon,
  removeCoupon,
} from "../../services/user/coupon.service.js";
import { asyncHandler, sendResponse } from "../../utils/helpers.js";

export const applyCouponController = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw createHttpError(400, "Coupon code is required");

  const cart = await applyCoupon(req.user._id, code);
  sendResponse(res, { message: "Coupon applied", payload: cart });
});

export const removeCouponController = asyncHandler(async (req, res) => {
  const cart = await removeCoupon(req.user._id);
  sendResponse(res, { message: "Coupon removed", payload: cart });
});
