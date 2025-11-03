import Product from "../../../models/product.model.js";
import Category from "../../../models/category.model.js";
import logger from "../../../config/logger.js";

export const getLandingCategoriesWithProducts = async (
  page = 1,
  limit = 10
) => {
  const categories = await Category.find({
    inHome: true,
    isDeleted: false,
    isListed: true,
  })
    .select("_id title")
    .lean();

  const categoriesWithProducts = await Promise.all(
    categories.map(async (cat) => {
      const skip = (page - 1) * limit;

      const products = await Product.find({
        categoryIds: { $in: [cat._id] },
        isDeleted: false,
        isListed: true,
      })
        .select("_id title slug price rating imageIds")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalProducts = await Product.countDocuments({
        categoryIds: { $in: [cat._id] },
        isDeleted: false,
        isListed: true,
      });
      return {
        title: cat.title,
        products,
        pagination: {
          totalProducts,
          limit,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
        },
      };
    })
  );

  return categoriesWithProducts;
};
