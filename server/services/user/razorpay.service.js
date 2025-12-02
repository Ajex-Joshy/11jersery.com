import logger from "../../config/logger.js";
import razorpayInstance from "../../config/razorpay.js";
import { AppError } from "../../utils/helpers.js";
import crypto from "crypto";
import { env } from "../../config/env.js";

export const createRazorpayOrder = async (
  amount,
  currency = "INR",
  notes = {}
) => {
  try {
    const options = {
      amount: amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes,
    };
    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    logger.error("Razorpay Create Order Error:", error);
    throw new AppError(
      502,
      "PAYMENT_ERROR",
      "Failed to create payment order with provider."
    );
  }
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_TEST_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new AppError(
      400,
      "PAYMENT_VERIFICATION_FAILED",
      "Payment verification failed: Invalid signature."
    );
  }
  return true;
};
