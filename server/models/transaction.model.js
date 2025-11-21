import mongoose, { Schema, Types } from "mongoose";

const PAYMENT_METHOD_ENUM = ["RAZORPAY", "WALLET", "COD", "NONE"];

const transactionSchema = new Schema(
  {
    transactionCode: { type: String, unique: true },

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
      required: false,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },

    balanceBefore: { type: Number },
    balanceAfter: { type: Number },

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
        "WALLET_TOPUP",
        "WALLET_PAYMENT",
        "REFERRAL_BONUS",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_ENUM,
      required: true,
      index: true,
    },

    gateway: {
      paymentId: { type: String },
      orderId: { type: String },
      signature: { type: String },
      walletRef: { type: String },
    },

    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

transactionSchema.pre("save", async function (next) {
  if (this.transactionCode) return next();
  const last = await this.constructor.findOne(
    {},
    {},
    { sort: { createdAt: -1 } }
  );
  const lastNum = last?.transactionCode
    ? parseInt(last.transactionCode.replace("TXN-", ""))
    : 0;
  const newNum = (lastNum + 1).toString().padStart(6, "0");
  this.transactionCode = `TXN-${newNum}`;
  next();
});

export default mongoose.model("Transaction", transactionSchema);
