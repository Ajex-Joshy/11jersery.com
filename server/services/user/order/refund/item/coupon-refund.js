export const calculateCouponRefundAmount = (order, item) => {
  const { discount, discountType, minPurchaseAmount, maxDiscountAmount } =
    order?.price?.appliedCoupon;

  const originalDiscount = order?.price?.couponDiscount;
  const originalTotal = order?.price?.total;

  const remainingTotal = originalTotal - item.salePrice * item.quantity;

  let recalculatedDiscount = 0;

  if (discountType === "FLAT") {
    if (remainingTotal >= minPurchaseAmount) {
      recalculatedDiscount = discount;
    } else {
      recalculatedDiscount = 0;
    }
  }

  if (discountType === "PERCENTAGE") {
    if (remainingTotal >= minPurchaseAmount) {
      recalculatedDiscount = (remainingTotal * discount) / 100;

      if (recalculatedDiscount > maxDiscountAmount) {
        recalculatedDiscount = maxDiscountAmount;
      }
    } else {
      recalculatedDiscount = 0;
    }
  }

  return {
    recalculatedCouponDiscount: recalculatedDiscount,
    couponRefundAmount: Math.round(originalDiscount - recalculatedDiscount),
  };
};
