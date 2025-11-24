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
      subtotal: {
        type: Number,
        required: true,
        min: [0, "Subtotal cannot be negative"],
      },
      discountedPrice: {
        type: Number,
        required: true,
        min: [0, "Discounted price cannot be negative"],
      },
      deliveryFee: {
        type: Number,
        required: true,
        min: [0, "Delivery fee cannot be negative"],
      },
      total: {
        type: Number,
        required: true,
        min: [0, "Total cannot be negative"],
      },
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
