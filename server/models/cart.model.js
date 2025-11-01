import mongoose, { Schema, Types } from "mongoose";

/**
 * Sub-document schema for items within the cart.
 */
const cartItemSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product", // References your 'Product' model
      required: [true, "Product ID is required."],
    },
    size: {
      type: String,
      required: [true, "Product size is required."],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Item quantity is required."],
      min: [1, "Quantity must be at least 1."],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, "Price at time of add is required."], // Price snapshot
      min: [0, "Price cannot be negative."],
    },
  },
  {
    timestamps: true,
  }
);

const cartSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User", // References your 'User' model
      required: [true, "User ID is required."],
      unique: true, // Ensures one cart per user
      index: true,
    },
    items: {
      type: [cartItemSchema], // An array of cart items
      default: [],
    },
  },
  {
    timestamps: true, // Tracks 'createdAt' and 'updatedAt' for the cart itself
    toJSON: { virtuals: true }, // Ensure virtuals are included when cart is sent as JSON
    toObject: { virtuals: true },
  }
);

cartSchema.virtual("subtotal").get(function () {
  if (!this.items || this.items.length === 0) {
    return 0;
  }

  // Calculate total price by summing up (price * quantity) for each item
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
