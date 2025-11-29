import mongoose, { Schema, Types } from "mongoose";

const PAYMENT_METHOD_ENUM = ["RAZORPAY", "WALLET", "COD", "NONE"];

const transactionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // optional , it can be wallet top up
    orderId: {
      type: Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    amount: {
      subtotal: { type: Number, required: true },
      discount: { type: Number },
      specialDiscount: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: null },
      couponCode: { type: String },
      referralBonus: { type: Number, default: 0 },
      couponId: { type: Types.ObjectId, ref: "Coupon" },
      appliedCategoryOffer: {
        categoryId: { type: Types.ObjectId, ref: "Category" },
        minPurchaseAmount: { type: Number },
        maxRedeemable: { type: Number },
        discountType: { type: String },
        discount: { type: Number },
      },
      appliedCoupon: {
        code: { type: String },
        discount: { type: Number },
        discountType: { type: String },
        minPurchaseAmount: { type: Number },
        maxDiscountAmount: { type: Number },
      },
      deliveryFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "ORDER_PAYMENT",
        "ORDER_REFUND",
        "REFERRAL_BONUS",
        "ORDER_CANCELLED",
        "ORDER_ITEM_CANCELLED",
        "RECALCULATED_ORDER_PAYMENT",
        "ORDER_REFUND_ITEM",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED", "UNPAID", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_ENUM,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
