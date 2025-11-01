import mongoose from "mongoose";
import createError from "http-errors";
import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";

const _findUserCart = async (userId) => {
  return await Cart.findOne({ userId }).populate({
    path: "items.productId",
    select: "_id title slug price imageIds rating",
  });
};

export const getCart = async (userId) => {
  let cart = await _findUserCart(userId);

  if (!cart) {
    return await Cart.create({ userId, items: [] });
  }
  return cart;
};

/**
 * Adds an item to the user's cart.
 * If the item (product + size) already exists, its quantity is increased.
 * Performs stock checks and price snapshotting.
 *
 * @param {string} userId - The user's MongoDB ObjectId.
 * @param {object} itemData - { productId, size, quantity }
 * @returns {Promise<object>} The updated, populated cart.
 */
export const addItem = async (userId, { productId, size, quantity }) => {
  // 1. Validate the product and stock
  const product = await Product.findById(productId);
  if (!product || !product.isListed) {
    throw createError(404, "Product not found or is no longer available.");
  }

  const variant = product.variants.find((v) => v.size === size);
  if (!variant) {
    throw createError(404, "Selected size is not available for this product.");
  }

  // 2. Get or create the user's cart
  // We use the unpopulated cart for modification, then populate at the end
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // 3. Check if item already exists in cart
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

    // Add new item with price snapshot
    cart.items.push({
      productId,
      size,
      quantity,
      price: product.price.sale, // Snapshot the sale price
    });
  }

  // 4. Save the cart
  await cart.save();

  // 5. Return the fully populated cart
  return await _findUserCart(userId);
};

/**
 * Updates the quantity of a specific item in the cart.
 *
 * @param {string} userId - The user's MongoDB ObjectId.
 * @param {string} itemId - The sub-document _id of the item in the cart.
 * @param {number} quantity - The new quantity.
 * @returns {Promise<object>} The updated, populated cart.
 */
export const updateItemQuantity = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw createError(404, "Cart not found.");
  }

  const item = cart.items.id(itemId); // Mongoose helper to find sub-document by _id
  if (!item) {
    throw createError(404, "Item not found in cart.");
  }

  // Check stock
  const product = await Product.findById(item.productId);
  if (!product) {
    throw createError(404, "Product associated with item not found.");
  }

  const variant = product.variants.find((v) => v.size === item.size);
  if (!variant) {
    throw createError(404, "Product variant not found.");
  }

  if (variant.stock < quantity) {
    throw createError(
      400,
      `Insufficient stock. Only ${variant.stock} available.`
    );
  }

  item.quantity = quantity;
  await cart.save();
  return await _findUserCart(userId);
};

/**
 * Removes a specific item from the cart.
 *
 * @param {string} userId - The user's MongoDB ObjectId.
 * @param {string} itemId - The sub-document _id of the item in the cart.
 * @returns {Promise<object>} The updated, populated cart.
 */
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

/**
 * Merges an array of local cart items (from guest) into the user's DB cart.
 * This is the core logic for the "hybrid cart".
 *
 * @param {string} userId - The user's MongoDB ObjectId.
 * @param {Array<object>} localItems - Array of { productId, size, quantity }
 * @returns {Promise<object>} The final merged, populated cart.
 */
export const mergeCart = async (userId, localItems) => {
  const cart = await getCart(userId); // Gets or creates the user's cart

  // Get all unique product IDs from the local cart
  const productIds = [...new Set(localItems.map((item) => item.productId))];

  // Fetch all relevant products from DB at once
  const products = await Product.find({
    _id: { $in: productIds },
    isListed: true,
  });

  // Create a quick-lookup map for products
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  for (const localItem of localItems) {
    const product = productMap.get(localItem.productId);

    // Skip if product doesn't exist or isn't listed
    if (!product) continue;

    const variant = product.variants.find((v) => v.size === localItem.size);
    // Skip if variant doesn't exist
    if (!variant) continue;

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === localItem.productId &&
        item.size === localItem.size
    );

    const availableStock = variant.stock;

    if (existingItem) {
      // --- Item exists: Merge Quantities ---
      const newQuantity = existingItem.quantity + localItem.quantity;

      // Add up to the available stock
      existingItem.quantity = Math.min(newQuantity, availableStock);
      // Update price snapshot
      existingItem.price = product.price.sale;
    } else {
      // --- New Item: Add to Cart ---
      if (availableStock > 0) {
        // Add item, but cap quantity at available stock
        const newQuantity = Math.min(localItem.quantity, availableStock);

        cart.items.push({
          productId: localItem.productId,
          size: localItem.size,
          quantity: newQuantity,
          price: product.price.sale, // Snapshot price
        });
      }
      // If stock is 0, we simply don't add it.
    }
  }

  await cart.save();
  return await _findUserCart(userId);
};

/**
 * Removes all items from a user's cart.
 *
 * @param {string} userId - The user's MongoDB ObjectId.
 * @returns {Promise<object>} The updated (empty), populated cart.
 */
export const clearCart = async (userId) => {
  const cart = await _findUserCart(userId);
  if (!cart) {
    return; // No cart to clear
  }

  cart.items = [];
  await cart.save();
  return cart;
};
