import { calculateOrderPrice } from "./pricing.service.js";
import { finalizeOrderCreation } from "./order-core.service.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../razorpay.service.js";

import { debitWallet } from "../wallet.services.js";
import Cart from "../../../models/cart.model.js";
import mongoose from "mongoose";

export const placeCodOrder = async (userId, shippingAddressId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ userId });
    const items = cart.items || [];
    const priceData = await calculateOrderPrice(items);
    console.log(cart.toJSON(), items);

    const order = await finalizeOrderCreation(session, {
      userId,
      items: priceData.items,
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

export const initOnlineOrder = async (userId, items) => {
  const priceData = await calculateOrderPrice(items);

  const razorpayOrder = await createRazorpayOrder(priceData.total, receiptId);

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: priceData.total,
    currency: razorpayOrder.currency,
    priceData, // Send this back so frontend can confirm totals
  };
};

export const verifyAndPlaceOnlineOrder = async (
  userId,
  items,
  shippingAddress,
  paymentDetails // { razorpayOrderId, razorpayPaymentId, razorpaySignature }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Security Check
    const isValid = verifyRazorpaySignature(
      paymentDetails.razorpayOrderId,
      paymentDetails.razorpayPaymentId,
      paymentDetails.razorpaySignature
    );

    if (!isValid) throw new Error("Invalid Payment Signature");

    // 2. Recalculate (Security: ensure client didn't change items between Init and Pay)
    const priceData = await calculateOrderPrice(items);

    // 3. Create Order in DB
    const order = await finalizeOrderCreation(session, {
      userId,
      items: priceData.items,
      shippingAddress,
      paymentMethod: "ONLINE",
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

export const placeWalletOrder = async (userId, shippingAddressId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ userId });
    const items = cart.items || [];
    const priceData = await calculateOrderPrice(items);

    // 1. Check and Debit Wallet
    await debitWallet(session, userId, priceData.total, null, "Order Payment");

    // 2. Create Order
    const order = await finalizeOrderCreation(session, {
      userId,
      items: priceData.items,
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
