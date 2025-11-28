import {
  finalizeOrderCreation,
  generateOrderTimeline,
} from "./order-core.service.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../razorpay.service.js";

import { debitWallet } from "../wallet.services.js";
import Cart from "../../../models/cart.model.js";
import mongoose from "mongoose";
import Order from "../../../models/order.model.js";
import Transaction from "../../../models/order-transaction.model.js";
import { MAX_QUANTITY_PER_ORDER } from "../../../utils/constants.js";
import Address from "../../../models/address.model.js";
import { calculateOrderPrice } from "./pricing/pricing.service.js";
import { processCartItems } from "./utils/processCartItems.js";
import { clearCart } from "../cart.services.js";
import { applyReferralBonus } from "./pricing/referral-bonus.service.js";
import Coupon from "../../../models/coupon.model.js";

export const placeCodOrder = async (userId, shippingAddressId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ userId });
    const priceData = await calculateOrderPrice(cart);
    const processedItems = await processCartItems(cart);

    const order = await finalizeOrderCreation(session, {
      userId,
      items: processedItems,
      shippingAddressId,
      paymentMethod: "COD",
      priceData,
    });

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const initOnlineOrder = async (userId, shippingAddressId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ userId });
    const priceData = await calculateOrderPrice(cart);
    const items = await processCartItems(cart);

    const razorpayOrder = await createRazorpayOrder(priceData.total);
    for (const item of items) {
      if (item.quantity > MAX_QUANTITY_PER_ORDER) {
        throw new Error(
          `Maximum quantity per item is ${MAX_QUANTITY_PER_ORDER}`
        );
      }
    }
    const [shippingAddress] = await Address.find({
      _id: shippingAddressId,
      userId,
      isDeleted: false,
    }).select("-createdAt -updatedAt -__v");
    if (!shippingAddress)
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "NOT_FOUND",
        "Address not found"
      );

    const [order] = await Order.create(
      [
        {
          userId,
          items,
          shippingAddress,
          payment: { method: "RAZORPAY", razorpayOrderId: razorpayOrder.id },
          orderStatus: "Initialized",
          price: priceData,

          timeline: generateOrderTimeline(),
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return {
      razorpayOrderId: razorpayOrder.id,
      amount: priceData.total * 100,
      currency: razorpayOrder.currency,
      priceData, // Send this back so frontend can confirm totals
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const verifyAndPlaceOnlineOrder = async (
  { userId, paymentDetails } // { razorpayOrderId, razorpayPaymentId, razorpaySignature }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      paymentDetails;
    // 1. Security Check
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) throw new Error("Invalid Payment Signature");

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
    });
    if (!order) {
      throw new Error("Order not found for the given Razorpay Order ID");
    }
    order.orderStatus = "Pending";
    order.payment.status = "Paid";

    const priceData = order.price;

    const [transaction] = await Transaction.create(
      [
        {
          userId,
          orderId: order._id,
          amount: priceData,
          type: "CREDIT",
          reason: "ORDER_PAYMENT",
          status: "SUCCESS",
          paymentMethod: "RAZORPAY",
        },
      ],
      { session }
    );

    // 4. Link Transaction to Order
    order.transactionIds.push(transaction._id);
    await order.save();
    if (priceData.referralBonus > 0) {
      applyReferralBonus(userId, priceData.referralBonus);
    }
    if (priceData.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: priceData.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }
    clearCart(userId);
    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const placeWalletOrder = async (userId, shippingAddressId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ userId });
    const processedItems = await processCartItems(cart);
    const priceData = await calculateOrderPrice(cart);

    // 1. Check and Debit Wallet
    await debitWallet(session, userId, priceData.total, null, "Order Payment");

    // 2. Create Order
    const order = await finalizeOrderCreation(session, {
      userId,
      items: processedItems,
      shippingAddressId,
      paymentMethod: "WALLET",
      priceData,
      transactionStatus: "SUCCESS",
    });

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
