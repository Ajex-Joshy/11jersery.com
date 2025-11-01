import mongoose, { Types } from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    categoryIds: {
      type: [{ type: Types.ObjectId, ref: "Category" }],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one categoryId is required",
      },
      index: true,
    },
    description: { type: String, maxlength: 2000 },
    shortDescription: { type: String, maxlength: 500 },
    price: {
      list: { type: Number, required: true, min: 0 },
      sale: { type: Number, min: 0 },
    },
    imageIds: [{ type: String }],
    variants: [
      {
        sku: { type: String, required: true },
        size: { type: String },
        stock: { type: Number, default: 0, min: 0 },
      },
    ],
    rating: {
      average: { type: Number, min: 0, max: 5, default: 3.5 },
      count: { type: Number, min: 0 },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    details: [
      {
        attribute: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    tags: {
      type: [{ type: String }],
      validate: {
        validator: function (v) {
          return !v || v.length <= 10;
        },
        message: "Tags array can have at most 10 elements",
      },
    },
    isListed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
