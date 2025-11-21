import createError from "http-errors";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";
import { getSignedUrlForKey } from "../admin/service-helpers/s3.service.js";

const _findUserCart = async (userId) => {
  const cart = await Cart.findOne({ userId })
    .populate({
      path: "items.productId",
      select: "title price imageIds slug",
    })
    .select("-__v -createdAt -updatedAt")
    .lean();
  cart.items = await Promise.all(
    cart.items.map(async (item) => {
      const product = item.productId;
      const productImageIds = product.imageIds || [];
      let imageUrl = null;

      if (productImageIds.length > 0) {
        imageUrl = await getSignedUrlForKey(productImageIds[0]);
      }

      const { imageIds, ...restProduct } = product;

      return {
        ...item,
        productDetails: {
          ...restProduct,
          imageUrl,
        },
        productId: product._id,
      };
    })
  );

  if (!cart) return null;

  let subtotal = 0;
  let discountAmount = 0;

  cart.items.forEach((item) => {
    const product = item.productDetails;
    if (!product) return;

    const price = product.price?.sale || 0;
    const qtyTotal = price * item.quantity;

    subtotal += qtyTotal;

    const listPrice = product.price?.list || price;
    const perItemDiscount = Math.max(listPrice - price, 0);
    discountAmount += perItemDiscount * item.quantity;
  });

  let total = subtotal - discountAmount;

  const deliveryFee = total > 500 ? 0 : 80;
  total = total + deliveryFee;

  return {
    ...cart,
    subtotal,
    discount: discountAmount,
    total,
    deliveryFee,
  };
};

export const getCart = async (userId) => {
  let cart = await _findUserCart(userId);

  if (!cart) {
    return await Cart.create({ userId, items: [] });
  }
  return cart;
};

export const addItem = async (userId, { productId, size, quantity }) => {
  // Validate the product and stock
  const product = await Product.findById(productId);
  if (!product || !product.isListed || product.isDeleted) {
    throw createError(404, "Product not found or is no longer available.");
  }

  const variant = product.variants.find((v) => v.size === size);
  if (!variant) {
    throw createError(404, "Selected size is not available for this product.");
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Check if item already exists in cart
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId && item.size === size
  );

  if (existingItem) {
    // --- Update Existing Item ---
    const newQuantity = existingItem.quantity + quantity;

    // Check stock
    if (variant.stock < newQuantity) {
      throw createError(
        400,
        `Insufficient stock. Only ${variant.stock} total available.`
      );
    }
    existingItem.quantity = newQuantity;
    // Update the price snapshot in case it changed
    existingItem.price = product.price.sale;
  } else {
    // --- Add New Item ---
    // Check stock
    if (variant.stock < quantity) {
      throw createError(
        400,
        `Insufficient stock. Only ${variant.stock} available.`
      );
    }

    cart.items.push({
      productId,
      size,
      quantity,
      price: product.price.sale,
    });
  }

  await cart.save();

  return await _findUserCart(userId);
};

export const adjustItemQuantity = async (userId, itemId, action) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw createError(404, "Cart not found.");
  console.log(cart.items);

  const item = cart.items.find((i) => {
    return i._id.toString() == itemId;
  });
  if (!item) throw createError(404, "Item not found in cart.");

  const product = await Product.findById(item.productId);
  if (!product) throw createError(404, "Product not found.");

  const variant = product.variants.find((v) => v.size === item.size);
  if (!variant) throw createError(404, "Product variant not found.");

  let newQuantity = item.quantity;

  if (action === "increment") {
    newQuantity += 1;

    if (newQuantity > variant.stock) {
      throw createError(
        400,
        `Insufficient stock. Only ${variant.stock} available.`
      );
    }
  }

  if (action === "decrement") {
    if (item.quantity === 1) {
      cart.items.pull({ _id: itemId });
      await cart.save();
      return await _findUserCart(userId);
    }

    newQuantity -= 1;
  }

  item.quantity = newQuantity;
  await cart.save();

  return await _findUserCart(userId);
};

export const removeItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw createError(404, "Cart not found.");
  }

  // Use Mongoose's .pull() to remove the sub-document by its _id
  cart.items.pull({ _id: itemId });

  await cart.save();
  return await _findUserCart(userId);
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return;
  }

  cart.items = [];
  await cart.save();
  return cart;
};
