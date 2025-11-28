import Order from "../../../models/order.model.js";
import Transaction from "../../../models/order-transaction.model.js";
import { reduceStock } from "./stock.service.js";
import { sendOrderConfirmationEmail } from "./sendOrderConfirmationEmail.js";
import Address from "../../../models/address.model.js";
import { clearCart } from "../cart.services.js";
import {
  MAX_QUANTITY_PER_ORDER,
  STATUS_CODES,
} from "../../../utils/constants.js";
import Coupon from "../../../models/coupon.model.js";
import { applyReferralBonus } from "./pricing/referral-bonus.service.js";
import { AppError } from "../../../utils/helpers.js";

export const generateOrderTimeline = () => {
  const now = new Date();
  return {
    placedAt: now,
    confirmedAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    shippedAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
  };
};

export const finalizeOrderCreation = async (
  session,
  {
    userId,
    items,
    shippingAddressId,
    paymentMethod,
    priceData,
    transactionStatus = "PENDING",
  }
) => {
  // Prevent empty cart orders
  if (!items || items.length === 0) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "EMPTY_CART",
      "Cannot place an order with empty cart"
    );
  }

  // Validate price data
  if (
    priceData.subtotal < 0 ||
    priceData.total < 0 ||
    priceData.discount < 0 ||
    priceData.specialDiscount < 0 ||
    priceData.couponDiscount < 0 ||
    priceData.deliveryFee < 0
  ) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_PRICE",
      "Price values cannot be negative"
    );
  }

  if (priceData.total > priceData.subtotal + priceData.deliveryFee) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_PRICE",
      "Total cannot be greater than subtotal + deliveryFee"
    );
  }

  if (
    priceData.total !==
    priceData.subtotal -
      (priceData.discount +
        priceData.specialDiscount +
        priceData.couponDiscount +
        priceData.referralBonus) +
      priceData.deliveryFee
  ) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "PRICE_MISMATCH",
      "Price calculation mismatch"
    );
  }

  // Prevent multiple pending orders
  const existingPending = await Order.findOne({
    userId,
    status: { $in: ["pending", "processing"] },
  }).session(session);

  if (existingPending) {
    throw new AppError(
      STATUS_CODES.CONFLICT,
      "ORDER_IN_PROGRESS",
      "You already have an order in process"
    );
  }

  // Retry wrapper for transient transaction errors
  const retryTransaction = async (txnFunc, maxRetries = 5) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await session.startTransaction();
        const result = await txnFunc();
        await session.commitTransaction();
        return result;
      } catch (err) {
        await session.abortTransaction();
        if (
          err.hasErrorLabel &&
          err.hasErrorLabel("TransientTransactionError")
        ) {
          console.log(
            `Transient transaction error, retrying... attempt ${attempt + 1}`
          );
          continue;
        } else {
          throw err;
        }
      }
    }
    throw new Error("Transaction failed after maximum retries");
  };

  // Execute transaction with retry
  const order = await retryTransaction(async () => {
    // Reduce stock atomically
    for (const item of items) {
      if (item.quantity > MAX_QUANTITY_PER_ORDER) {
        throw new Error(
          `Maximum quantity per item is ${MAX_QUANTITY_PER_ORDER}`
        );
      }
      await reduceStock(session, item.productId, item.size, item.quantity);
    }

    const [shippingAddress] = await Address.find({
      _id: shippingAddressId,
      userId,
      isDeleted: false,
    }).select("-createdAt -updatedAt -__v");

    if (!shippingAddress) {
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "NOT_FOUND",
        "Address not found"
      );
    }

    // Create Order
    const [orderCreated] = await Order.create(
      [
        {
          userId,
          items,
          shippingAddress,
          payment: { method: paymentMethod },
          status: paymentMethod === "COD" ? "pending" : "confirmed",
          price: priceData,
          timeline: generateOrderTimeline(),
        },
      ],
      { session }
    );

    // Create Transaction
    const [transaction] = await Transaction.create(
      [
        {
          userId,
          orderId: orderCreated._id,
          amount: priceData,
          type: "CREDIT",
          reason: "ORDER_PAYMENT",
          status: transactionStatus,
          paymentMethod,
        },
      ],
      { session }
    );

    // Apply coupon and referral bonus atomically
    if (priceData.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: priceData.couponCode },
        { $inc: { usedCount: 1 } },
        { session }
      );
    }

    if (priceData.referralBonus > 0) {
      await applyReferralBonus(userId, priceData.referralBonus, session);
    }

    // Link Transaction to Order
    orderCreated.transactionIds.push(transaction._id);
    await orderCreated.save({ session });

    return orderCreated;
  });

  sendOrderConfirmationEmail(order);
  clearCart(userId);

  return order;
};
