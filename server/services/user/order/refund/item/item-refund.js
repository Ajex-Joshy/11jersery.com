import { DELIVERY_FEE, FREESHIP_MIN } from "../../../../../utils/constants.js";
import { calculateCategoryDiscountRefund } from "./category-refund.js";
import { calculateCouponRefundAmount } from "./coupon-refund.js";
import { calculateReferralRefundAmount } from "./recalculated-referral-bonus.js";

export const recalculatedOrderAmount = async (order, item) => {
  const { recalculatedSpeicialDiscount, categoryRefundAmount } =
    await calculateCategoryDiscountRefund(order, item);
  const { recalculatedCouponDiscount, couponRefundAmount } =
    calculateCouponRefundAmount(order, item);
  const { recalculatedReferralBonus, referralRefundAmount } =
    calculateReferralRefundAmount(order, item);

  // -------- Discount validations --------
  [categoryRefundAmount, couponRefundAmount, referralRefundAmount].forEach(
    (value) => {
      if (typeof value !== "number" || value < 0)
        throw new Error("Invalid refund value");
    }
  );

  // -------- Calculations --------
  const subtotal = order.price.subtotal - item.listPrice * item.quantity;

  if (subtotal < 0) throw new Error("Subtotal cannot be negative after refund");

  const specialDiscount = recalculatedSpeicialDiscount;
  const couponDiscount = recalculatedCouponDiscount;
  const referralBonus = recalculatedReferralBonus;

  let refundAmount =
    item.salePrice -
    categoryRefundAmount -
    couponRefundAmount -
    referralRefundAmount;

  if (refundAmount < 0) refundAmount = 0;
  if (refundAmount > item.salePrice)
    throw new Error("Refund exceeds item sale price");

  const total = order.price.total - refundAmount;

  if (total < 0) throw new Error("Total cannot be negative after refund");

  const deliveryFee = total > FREESHIP_MIN ? 0 : DELIVERY_FEE;

  return {
    subtotal,
    specialDiscount,
    couponDiscount,
    referralBonus,
    total,
    deliveryFee,
    total,
    refundAmount,
  };
};
