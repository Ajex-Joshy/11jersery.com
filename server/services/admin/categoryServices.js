import Category from "../../models/categoryModel.js";
import {
  AppError,
  buildCategoryQuery,
  getPagination,
  getSortOption,
} from "../../utils/helpers.js";
import {
  AppError,
  buildCategoryQuery,
  getPagination,
  getSortOption,
} from "../../utils/helpers.js";
import {
  checkSlugUniqueness,
  validateObjectId,
} from "../../utils/productutils.js";
import { buildCategoryStockPipeline } from "./queryHelpers.js";
import { buildCategoryStockPipeline } from "./queryHelpers.js";

export const createCategory = async (categoryData) => {
  const slug = await checkSlugUniqueness(
    Category,
    categoryData.title,
    "Category"
  );
  return await Category.create({
    ...categoryData,
    slug,
    s,
    s,
  });
};

export const updateCategory = async (categoryId, updateData) => {
  validateObjectId(categoryId);

  if (updateData.title) {
    updateData.slug = await checkSlugUniqueness(
      Category,
      updateData.title,
      "Category"
    );
  }
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    updateData,
    {
      new: true, // return the updated document
      runValidators: true, // run schema validators on update
    }
  );

  if (!updatedCategory) {
    throw new AppError(
      404,
      "CATEGORY_NOT_FOUND",
      "Category not found with this ID"
    );
  }

  return updatedCategory;
};

export const softDeleteCategory = async (categoryId) => {
  validateObjectId(categoryId);

  // Update category to mark as deleted
  const deletedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { isDeleted: true, isListed: false },
    { new: true, runValidators: true }
  );

  if (!deletedCategory) {
    throw new AppError(
      404,
      "CATEGORY_NOT_FOUND",
      "Category not found with this ID"
    );
  }

  return deletedCategory;
};

export const updateCategoryStatus = async (categoryId, status) => {
  validateObjectId(categoryId);
  if (typeof status !== "boolean") {
    throw new AppError(400, "INVALID_STATUS", "Status must be a boolean value");
  }

  // Update category to mark as deleted
  const updateCategory = await Category.findByIdAndUpdate(
    categoryId,
    { isListed: status },
    { new: true, runValidators: true }
  );

  if (!updateCategory) {
    throw new AppError(
      404,
      "CATEGORY_NOT_FOUND",
      "Category not found with this ID"
    );
  }

  return updateCategory;
};

// const buildCategoryStockPipeline = (query, sort, skip, pageSize) => [
//   { $match: query },
//   { $sort: sort },
//   { $skip: skip },
//   { $limit: pageSize },
//   {
//     $lookup: {
//       from: "products",
//       let: { categoryId: "$_id" },
//       pipeline: [
//         { $match: { $expr: { $in: ["$$categoryId", "$categoryIds"] } } },
//         { $unwind: "$variants" },
//         {
//           $group: {
//             _id: null,
//             totalStock: { $sum: "$variants.stock" },
//             productCount: { $sum: 1 },
//           },
//         },
//       ],
//       as: "meta",
//     },
//   },
//   {
//     $addFields: {
//       totalStock: { $ifNull: [{ $first: "$meta.totalStock" }, 0] },
//       productCount: { $ifNull: [{ $first: "$meta.productCount" }, 0] },
//     },
//   },
//   { $project: { meta: 0 } },
// ];

export const getCategories = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const query = buildCategoryQuery({ status, search });
  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);

  const pipeline = buildCategoryStockPipeline(query, sort, skip, pageSize);
  const [categories, totalCategories] = await Promise.all([
    Category.aggregate(pipeline),
    Category.countDocuments(query),
  ]);

  return {
    categories,
    pagination: {
      totalCategories,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCategories / pageSize),
      limit: pageSize,
    },
  };
};
