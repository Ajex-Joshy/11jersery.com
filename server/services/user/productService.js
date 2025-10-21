import Product from "../../models/productModel.js";
import Review from "../../models/reviewModel.js";
import { AppError } from "../../utils/helpers.js";
import mongoose from "mongoose";

export const getProductDetailsService = async (productSlug) => {
  // 1. Fetch product details by slug
  const product = await Product.findOne({
    slug: productSlug,
    isListed: true,
    isDeleted: false,
  }).lean();

  if (!product) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      `Product with slug "${productSlug}" not found`
    );
  }
  // 2. Fetch reviews for the product

  const reviews = await Review.find({ productId: product._id })
    .select("_id rating userName place comment createdAt productId")
    .sort({ createdAt: -1 })
    .lean();

  // 3. Fetch up to 4 other products from the same category
  const sameCategoryProducts = await Product.find({
    categoryIds: { $in: product.categoryIds },
    _id: { $ne: product._id },
    isListed: true,
    isDeleted: false,
  })
    .select("_id title slug price rating cloudinaryImageId")
    .limit(4)
    .lean();

  return {
    product,
    reviews,
    sameCategoryProducts,
  };
};
