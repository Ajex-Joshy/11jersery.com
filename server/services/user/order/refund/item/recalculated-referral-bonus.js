import {
  MAX_REFERRAL_BONUS,
  REFERRAL_BONUS_PERCENT,
} from "../../../../../utils/constants.js";

export const calculateReferralRefundAmount = (order, item) => {
  if (!order || !item) return 0;

  const originalBonus = order?.price?.referralBonus ?? 0;
  const originalTotal = order?.price?.total ?? 0;
  const remainingTotal = originalTotal - item.salePrice * item.quantity;
  if (originalBonus === 0)
    return { recalculatedReferralBonus: 0, referralRefundAmount: 0 };

  let newReferralBonus = (remainingTotal * REFERRAL_BONUS_PERCENT) / 100;

  if (newReferralBonus > MAX_REFERRAL_BONUS) {
    newReferralBonus = MAX_REFERRAL_BONUS;
  }

  const reduceAmount = originalBonus - newReferralBonus;

  return {
    recalculatedReferralBonus: Math.round(newReferralBonus),
    referralRefundAmount: Math.max(Math.round(reduceAmount), 0),
  };
};
