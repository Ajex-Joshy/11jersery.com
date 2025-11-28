import mongoose, { Schema } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // Always store uppercase
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FIXED"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount value cannot be negative"],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase amount cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number, // Only relevant for PERCENTAGE type
      default: null, // No limit by default
    },

    // Usage Limits
    usageLimit: {
      type: Number, // Total times this coupon can be used globally
      default: null, // Unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number, // Times a single user can use this
      default: 1,
    },

    // Validity Dates
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure discount value logic (e.g., percentage <= 100)
couponSchema.pre("save", function (next) {
  if (this.discountType === "PERCENTAGE" && this.discountValue > 100) {
    next(new Error("Percentage discount cannot exceed 100%"));
  } else {
    next();
  }
});

export default mongoose.model("Coupon", couponSchema);
