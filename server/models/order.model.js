import mongoose, { Schema, Types } from "mongoose";

const STATUS_ENUM = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
  "Return Requested",
  "Return Approved",
  "Return Rejected",
];

const PAYMENT_METHOD_ENUM = [
  "COD",
  "RAZORPAY",
  "UPI",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "NET_BANKING",
  "WALLET",
];

const PAYMENT_STATUS_ENUM = [
  "Pending",
  "Processing",
  "Paid",
  "Failed",
  "Refunded",
  "Cancelled",
  "Unpaid",
];

const orderItemSchema = new Schema({
  productId: { type: Types.ObjectId, ref: "Product", required: true },
  title: { type: String, required: true }, // Snapshot title
  slug: { type: String, required: true },
  imageId: { type: String, required: true },

  size: { type: String, required: true },

  // Financials per item
  listPrice: { type: Number, required: true }, // Price at purchase time
  salePrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },

  status: {
    type: String,
    enum: STATUS_ENUM,
    default: "Pending",
  },

  cancelReason: { type: String },
  returnReason: { type: String },

  timeline: {
    cancelledAt: { type: Date },
    returnRequestedAt: { type: Date },
    returnApprovedAt: { type: Date },
    returnRejectedAt: { type: Date },
    returnedAt: { type: Date },
  },
});

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },

    orderId: { type: String, unique: true },

    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    items: [orderItemSchema],

    transactionIds: [{ type: Types.ObjectId, ref: "Transaction" }],

    price: {
      subtotal: { type: Number, required: true },
      discountedPrice: { type: Number }, // Global discount
      couponCode: { type: String }, // Snapshot code
      couponId: { type: Types.ObjectId, ref: "Coupon" },
      deliveryFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    payment: {
      method: {
        type: String,
        enum: PAYMENT_METHOD_ENUM,
        required: true,
      },
      status: { type: String, enum: PAYMENT_STATUS_ENUM, default: "Pending" },
      razorpayPaymentId: { type: String },
      razorpayOrderId: { type: String },
    },

    orderStatus: {
      type: String,
      enum: STATUS_ENUM,
      default: "Pending",
      index: true,
    },

    timeline: {
      placedAt: { type: Date, default: Date.now },
      confirmedAt: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
      cancelledAt: { type: Date },
      returnRequestedAt: { type: Date },
      returnApprovedAt: { type: Date },
      returnRejectedAt: { type: Date },
      returnedAt: { type: Date },
    },

    // Admin Notes (Internal use)
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.orderId) return next(); // Skip if already assigned

  const lastOrder = await this.constructor.findOne(
    {},
    {},
    { sort: { createdAt: -1 } }
  );
  const lastNumber = lastOrder?.orderId
    ? parseInt(lastOrder.orderId.replace("ORD-", ""))
    : 0;

  const newNumber = lastNumber + 1;
  this.orderId = `ORD-${newNumber.toString().padStart(6, "0")}`;

  next();
});

export default mongoose.model("Order", orderSchema);
