import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    imageId: {
      type: String,
    },
    isListed: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"], // Added min validation
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["flat", "percent"],
      required: [
        function () {
          return this.discount > 0;
        },
        "Discount type is required when discount value is set",
      ],
    },
    minPurchaseAmount: {
      type: Number,
      min: [0, "Minimum purchase amount cannot be negative"],
      required: [
        function () {
          return this.discountType === "flat" && this.discount > 0;
        },
        "Minimum purchase amount is required for flat discounts",
      ],
      default: 0,
    },
    maxRedeemable: {
      type: Number,
      min: [0, "Max redeemable amount cannot be negative"],
      required: [
        function () {
          return this.discountType === "percent" && this.discount > 0;
        },
        "Maximum redeemable amount is required for percent discounts",
      ],
      default: 0,
    },
    inHome: {
      type: Boolean,
      default: false,
    },
    inCollections: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
