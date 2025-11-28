import Product from "../../../../models/product.model.js";

import {
  buildCategoryTotals,
  evaluateCategoryDiscount,
} from "./category-discount.service.js";
import { applyCouponDiscount } from "./coupon-discount.service.js";
import { checkReferralBonus } from "./referral-bonus.service.js";

export const calculateOrderPrice = async (cart) => {
  const items = cart.items;
  const couponCode = cart.couponCode;
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const { categoryTotals } = await buildCategoryTotals(items, products);

  let subtotal = 0;
  let discountedPriceBeforeCategory = 0;

  items.forEach((item) => {
    const product = products.find((p) => p._id.equals(item.productId));
    subtotal += product.price.list * item.quantity;
    discountedPriceBeforeCategory +=
      (product.price.sale ?? product.price.list) * item.quantity;
  });

  let bestCategoryDiscount = 0;
  for (const entry of Object.values(categoryTotals)) {
    bestCategoryDiscount = Math.max(
      bestCategoryDiscount,
      evaluateCategoryDiscount(entry)
    );
  }

  let priceAfterCategory = discountedPriceBeforeCategory - bestCategoryDiscount;

  const { couponDiscount } = await applyCouponDiscount(
    discountedPriceBeforeCategory,
    couponCode,
    cart.userId
  );

  let finalPrice = priceAfterCategory - couponDiscount;
  let referralBonus = 0;
  const isReferalBonusApplicable = await checkReferralBonus(
    cart.userId,
    finalPrice
  );

  if (isReferalBonusApplicable) {
    referralBonus = Math.round(Math.min(finalPrice * 0.1, 100));
    finalPrice -= referralBonus;
  }
  const deliveryFee = finalPrice < 500 && finalPrice > 0 ? 80 : 0;

  return {
    subtotal,
    discount: subtotal - discountedPriceBeforeCategory,
    specialDiscount: bestCategoryDiscount,
    couponDiscount,
    referralBonus,
    couponCode,
    deliveryFee,
    total: finalPrice + deliveryFee,
  };
};
