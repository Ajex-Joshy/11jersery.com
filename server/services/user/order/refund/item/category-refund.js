async function buildCategoryTotals(items, categoryId) {
  let totalAmount = 0;

  for (const item of items) {
    if (item.categoryIds.includes(categoryId)) {
      totalAmount += item.salePrice * item.quantity;
    }
  }

  return {
    categoryId,
    totalAmount,
  };
}

export const calculateCategoryDiscountRefund = async (order, item) => {
  const currentDiscount = order?.price?.specialDiscount ?? 0;

  const {
    categoryId,
    minPurchaseAmount,
    discountType,
    discount,
    maxRedeemable,
  } = order?.price?.appliedCategoryOffer;

  const items = order.items
    .filter((i) => i._id.toString() !== item._id.toString())
    .filter((i) => i.status !== "Cancelled");

  const { totalAmount } = await buildCategoryTotals(items, categoryId);

  let newDiscount = 0;

  if (discountType === "percent") {
    if (totalAmount >= minPurchaseAmount) {
      newDiscount = (totalAmount * discount) / 100;

      if (maxRedeemable && newDiscount > maxRedeemable) {
        newDiscount = maxRedeemable;
      }
    }
  }

  if (discountType === "flat") {
    if (totalAmount >= minPurchaseAmount) {
      newDiscount = discount;
    } else {
      newDiscount = 0;
    }
  }

  if (items.length === 0 || totalAmount < minPurchaseAmount) {
    newDiscount = 0;
  }

  const discountDifference = Math.max(currentDiscount - newDiscount, 0);

  return {
    recalculatedSpeicialDiscount: Math.round(newDiscount),
    categoryRefundAmount: Math.round(discountDifference),
  };
};
