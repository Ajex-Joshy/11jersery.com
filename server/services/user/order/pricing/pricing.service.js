import Product from "../../../../models/product.model.js";
import {
  DELIVERY_FEE,
  FREESHIP_MIN,
  MAX_REFERRAL_BONUS,
  REFERRAL_BONUS_PERCENT,
} from "../../../../utils/constants.js";

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
  let appliedCategoryOffer = null;
  for (const entry of Object.values(categoryTotals)) {
    const discountValue = evaluateCategoryDiscount(entry);
    if (discountValue > bestCategoryDiscount) {
      bestCategoryDiscount = discountValue;
      appliedCategoryOffer = {
        categoryId: entry.category._id,
        minPurchaseAmount: entry.category.minPurchaseAmount,
        maxRedeemable: entry.category.maxRedeemable,
        discountType: entry.category.discountType,
        discount: entry.category.discount,
      };
    }
  }

  let priceAfterCategory = discountedPriceBeforeCategory - bestCategoryDiscount;

  const { couponDiscount, appliedCoupon } = await applyCouponDiscount(
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
    referralBonus = Math.round(
      Math.min((finalPrice * REFERRAL_BONUS_PERCENT) / 100, MAX_REFERRAL_BONUS)
    );
    finalPrice -= referralBonus;
  }
  const deliveryFee =
    finalPrice < FREESHIP_MIN && finalPrice > 0 ? DELIVERY_FEE : 0;

  return {
    subtotal,
    discount: subtotal - discountedPriceBeforeCategory,
    specialDiscount: bestCategoryDiscount,
    appliedCategoryOffer,
    couponDiscount,
    referralBonus,
    couponCode,
    deliveryFee,
    total: finalPrice + deliveryFee,
    appliedCoupon,
  };
};
