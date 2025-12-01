import mongoose, { Schema, Types } from "mongoose";

const WalletTransactionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },

    type: {
      type: String,
      enum: ["CREDIT", "DEBIT"],
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "Order Payment",
        "Order Refund",
        "Wallet Top-Up",
        "REFERRAL_BONUS",
        "Order Cancelled",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Wallet-Transactions", WalletTransactionSchema);
