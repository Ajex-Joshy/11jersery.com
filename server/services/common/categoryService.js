import Category from "../../models/categoryModel.js";
import { AppError } from "../../utils/helpers.js";
import { buildCategoryProductPipeline } from "./categoryPipeline.js";

export const fetchCategoriesWithProducts = async (pipeline) => {
  if (!Array.isArray(pipeline)) {
    throw new Error("Pipeline must be an array");
  }

  try {
    const categories = await Category.aggregate(pipeline);
    return categories;
  } catch (error) {
    console.error("Error fetching categories with products:", error);
    throw error;
  }
};

export const getLandingCategoriesWithProducts = async (queryParams) => {
  const pipeline = buildCategoryProductPipeline({
    ...queryParams,
    inHome: true,
  });
  const categories = await fetchCategoriesWithProducts(pipeline);
  return categories;
};

export const getCategoryBySlugWithProducts = async (slug, queryParams) => {
  const category = await Category.findOne({
    slug,
    isListed: true,
    isDeleted: false,
  }).lean();
  if (!category)
    throw new AppError(
      404,
      "CATEGORY_NOT_FOUND",
      `Category with slug "${slug}" not found`
    );

  const pipeline = buildCategoryProductPipeline({
    ...queryParams,
    categoryId: category._id,
  });
  const results = await fetchCategoriesWithProducts(pipeline);
  return results[0] || null;
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
