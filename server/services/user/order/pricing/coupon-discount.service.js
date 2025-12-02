import Coupon from "../../../../models/coupon.model.js";
import { STATUS_CODES } from "../../../../utils/constants.js";
import { AppError } from "../../../../utils/helpers.js";
import { clearCoupon } from "../../cart.services.js";

export const applyCouponDiscount = async (subtotal, couponCode, userId) => {
  if (!couponCode)
    return {
      couponDiscount: 0,
      appliedCoupon: null,
    };

  const coupon = await Coupon.findOne({ code: couponCode });
  if (!coupon)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_COUPON",
      "Invalid coupon code"
    );

  if (subtotal < coupon.minPurchaseAmount) {
    await clearCoupon(userId);
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MIN_PURCHASE_REQUIRED",
      `Cart total must be at least ₹${
        coupon.minPurchaseAmount / 100
      } to use ${couponCode}`
    );
  }

  let couponDiscount = 0;
  if (coupon.discountType === "FIXED") {
    couponDiscount = coupon.discountValue;
  } else if (coupon.discountType === "PERCENTAGE") {
    couponDiscount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      couponDiscount = Math.min(
        couponDiscount,
        coupon.maxDiscountAmount,
        subtotal
      );
    }
  }
  return {
    couponDiscount,
    appliedCoupon: {
      code: coupon.code,
      discount: coupon.discountValue,
      discountType: coupon.discountType,
      minPurchaseAmount: coupon.minPurchaseAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
    },
  };
};
