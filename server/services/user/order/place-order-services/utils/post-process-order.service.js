// post-process-order.js

import { sendOrderConfirmationEmail } from "./sendOrderConfirmationEmail.js";
import { clearCart } from "../../../cart.services.js";
import { applyReferralBonus } from "../../pricing/referral-bonus.service.js";
import { removeCartItemsFromWishlist } from "../../../whislist.service.js";

export const postProcessOrder = async (
  userId,
  orderDetails,
  priceData,
  items
) => {
  await sendOrderConfirmationEmail(orderDetails);
  await clearCart(userId);
  await removeCartItemsFromWishlist(items, userId);

  if (priceData.referralBonus > 0)
    applyReferralBonus(userId, priceData.referralBonus);
};
