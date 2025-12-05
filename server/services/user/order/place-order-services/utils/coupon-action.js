import { AppError } from "../../../../../utils/helpers.js";
import { STATUS_CODES } from "../../../../../utils/constants.js";
import Coupon from "../../../../../models/coupon.model.js";

async function updateCouponUsage(couponCode, change) {
  if (!couponCode)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "COUPON_CODE_NOT_FOUND",
      "unable to apply coupon code"
    );

  const coupon = await Coupon.findOneAndUpdate(
    { code: couponCode },
    { $inc: { usedCount: change } },
    { new: true }
  );

  if (!coupon)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "COUPON_NOT_FOUND",
      "Coupon not valid"
    );

  if (coupon.usedCount > coupon.usageLimit)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "COUPON_USAGE_LIMIT_EXCEED",
      "Coupon discount is over"
    );

  return coupon;
}

export default updateCouponUsage;
