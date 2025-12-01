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

  const subtotal = order?.price?.subtotal - item?.listPrice * item.quantity;
  const specialDiscount = recalculatedSpeicialDiscount;
  const couponDiscount = recalculatedCouponDiscount;
  const referralBonus = recalculatedReferralBonus;
  const refundAmount =
    item?.salePrice -
    categoryRefundAmount -
    couponRefundAmount -
    referralRefundAmount;

  const total = Math.round(order?.price?.total - refundAmount);
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
