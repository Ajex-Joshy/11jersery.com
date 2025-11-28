import mongoose, { Schema, Types } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        type: Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);
