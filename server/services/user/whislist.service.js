import createError from "http-errors";
import Wishlist from "../../models/whislist.model.js";
import Product from "../../models/product.model.js";
import { getSignedUrlForKey } from "../admin/service-helpers/s3.service.js";

/**
 * Get the user's wishlist, populated with product details.
 */
export const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId }).populate({
    path: "products",
    select: "_id title slug price rating imageIds",
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [] });
  }

  const updatedProducts = [];
  for (let product of wishlist.products) {
    const obj = product.toObject();
    const imageUrl = await getSignedUrlForKey(obj.imageIds[0]);
    obj.imageUrl = imageUrl;
    delete obj.imageIds;
    updatedProducts.push(obj);
  }

  wishlist = wishlist.toObject();
  wishlist.products = updatedProducts;
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

  await wishlist.populate({
    path: "products",
    select: "_id title slug price rating imageIds",
  });

  return { wishlist, isAdded };
};

export const removeCartItemsFromWishlist = async (items, userId) => {
  const productIdsSet = new Set();
  items.forEach((item) => {
    productIdsSet.add(item.productId.toString());
  });
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    return { message: "Wishlist not found" };
  }

  wishlist.products = wishlist.products.filter(
    (product) => !productIdsSet.has(product._id.toString())
  );

  await wishlist.save();

  return { wishlist, removed: true };
};
