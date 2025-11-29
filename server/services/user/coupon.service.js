import Cart from "../../models/cart.model.js";
import Coupon from "../../models/coupon.model.js";
import { AppError } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const applyCoupon = async (userId, couponCode) => {
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0)
    throw new AppError(STATUS_CODES.BAD_REQUEST, "CART_EMPTY", "Cart is empty");

  // 1. Find Coupon
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "INVALID_COUPON",
      "Invalid or expired coupon code"
    );

  // 2. Validation Checks
  const now = new Date();
  if (now < coupon.startDate || now > coupon.expiryDate) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "COUPON_EXPIRED",
      "Coupon is expired"
    );
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "COUPON_LIMIT_REACHED",
      "Coupon usage limit reached"
    );
  }

  // Check per-user limit (requires checking previous orders - slightly complex, simplified here)
  // For now, we'll assume per-user limit check happens at order placement or via a separate 'CouponUsage' model.

  // 3. Calculate Cart Subtotal (from items)
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (subtotal < coupon.minPurchaseAmount) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MIN_PURCHASE_REQUIRED",
      `Cart total must be at least ₹${coupon.minPurchaseAmount} to use this coupon`
    );
  }

  // 4. Calculate Discount
  let discountAmount = 0;
  if (coupon.discountType === "FIXED") {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  }

  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  // 5. Update Cart State (We don't save coupon to DB, just return calculations for now,
  // OR we can save 'appliedCoupon' to the Cart schema if you want persistence)

  // Let's save it to the Cart model so it persists across refreshes
  cart.couponId = coupon._id;
  cart.couponCode = coupon.code;
  cart.discount = discountAmount;
  // Recalculate total
  // cart.total = subtotal - discountAmount + deliveryFee; (Handled in pre-save or virtual usually)

  let updateCart = await cart.save();
  return updateCart;
};

export const removeCoupon = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "CART_NOT_FOUND",
      "Cart not found"
    );

  cart.couponId = null;
  cart.couponCode = null;
  cart.discount = 0;

  let updateCart = await cart.save();
  return updateCart;
};
