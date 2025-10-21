import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";

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
        .select("_id title slug price rating cloudinaryImageIds")
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

export const getCollectionsData = async () => {
  const categories = await Category.find(
    {
      inCollections: true,
      isDeleted: false,
      isListed: true,
    },
    {
      _id: 1,
      title: 1,
      slug: 1,
      cloudinaryImageId: 1,
    }
  ).lean();
  return categories;
};
