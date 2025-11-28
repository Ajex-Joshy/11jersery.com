import asyncHandler from "express-async-handler";
import { sendResponse } from "../../utils/helpers.js";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} from "../../services/admin/coupon.services.js";
import { createCouponSchema } from "../../validators/admin/coupon-validator.js";
import createError from "http-errors";

export const createCouponController = asyncHandler(async (req, res) => {
  const { error, value } = createCouponSchema.validate(req.body);
  if (error) throw createError(400, error.details[0].message);

  const coupon = await createCoupon(value);

  sendResponse(res, coupon);
});

export const getCouponsController = asyncHandler(async (req, res) => {
  const result = await getAllCoupons(req.query);
  sendResponse(res, result);
});

export const updateCouponController = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const updatedCoupon = await updateCoupon(couponId, req.body);

  sendResponse(res, updatedCoupon);
});

export const deleteCouponController = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  await deleteCoupon(couponId);

  sendResponse(res, {
    message: "Coupon deleted successfully",
  });
});
