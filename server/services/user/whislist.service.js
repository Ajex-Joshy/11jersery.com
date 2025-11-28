import createError from "http-errors";
import Wishlist from "../../models/whislist.model.js";
import Product from "../../models/product.model.js";

/**
 * Get the user's wishlist, populated with product details.
 */
export const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId }).populate({
    path: "products",
    select: "_id title slug price rating imageIds", // Only need basic details
  });

  if (!wishlist) {
    // Create empty wishlist if it doesn't exist
    wishlist = await Wishlist.create({ userId, products: [] });
  }

  return wishlist;
};

/**
 * Toggle a product in the wishlist (Add if missing, Remove if present).
 */
export const toggleWishlistItem = async (userId, productId) => {
  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) throw createError(404, "Product not found");

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [productId] });
    return { wishlist, isAdded: true };
  }

  const index = wishlist.products.indexOf(productId);
  let isAdded = false;

  if (index === -1) {
    // Add
    wishlist.products.push(productId);
    isAdded = true;
  } else {
    // Remove
    wishlist.products.splice(index, 1);
    isAdded = false;
  }

  await wishlist.save();

  // Return populated wishlist so UI updates instantly
  await wishlist.populate({
    path: "products",
    select: "_id title slug price rating imageIds",
  });

  return { wishlist, isAdded };
};

/**
 * Check if a specific product is in the wishlist (Helper for product page).
 * Can be optimized by sending a list of IDs to frontend.
 */
export const checkWishlistStatus = async (userId, productId) => {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) return false;
  return wishlist.products.includes(productId);
};
