import mongoose, { Schema, Types } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: "Product",
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
      required: [true, "Price at time of add is required."],
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
      ref: "User",
      required: [true, "User ID is required."],
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema], // An array of cart items
      default: [],
    },
    couponCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Tracks 'createdAt' and 'updatedAt' for the cart itself
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
