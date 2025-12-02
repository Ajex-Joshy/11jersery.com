import Category from "../../models/category.model.js";
import { STATUS_CODES } from "../../utils/constants.js";
import {
  AppError,
  buildCategoryQuery,
  getPagination,
  getSortOption,
} from "../../utils/helpers.js";
import {
  checkSlugUniqueness,
  enrichCategoryWithSignedUrl,
  validateObjectId,
} from "../../utils/product.utils.js";
import { buildCategoryStockPipeline } from "./service-helpers/query-helpers.js";
import { toPaise } from "../../utils/currency.js";

export const createCategory = async (categoryData) => {
  const slug = await checkSlugUniqueness(
    Category,
    categoryData.title,
    "Category"
  );

  let finalData = {
    title: categoryData.title,
    slug: slug,
    imageId: categoryData.imageId,
    isListed: categoryData.isListed,
    inHome: categoryData.inHome ?? false,
    inCollections: categoryData.inCollections ?? false,
    discount: 0,
    discountType: undefined,
    minPurchaseAmount: 0,
    maxRedeemable: 0,
  };

  // Convert monetary values to paise if provided
  if (categoryData.discountType && categoryData.discount > 0) {
    finalData.discountType = categoryData.discountType;
    finalData.discount = toPaise(categoryData.discount);

    if (categoryData.discountType === "flat") {
      finalData.minPurchaseAmount = toPaise(
        categoryData.minPurchaseAmount ?? 0
      );
      finalData.maxRedeemable = 0;
    } else if (categoryData.discountType === "percent") {
      finalData.maxRedeemable = toPaise(categoryData.maxRedeemable ?? 0);
      finalData.minPurchaseAmount = 0;
    }
  }

  return await Category.create({
    ...finalData,
    slug,
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
  const categoryWithSignedUrls = await enrichCategoryWithSignedUrl(
    updatedCategory
  );

  if (!updatedCategory) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "CATEGORY_NOT_FOUND",
      "Category not found with this ID"
    );
  }

  return categoryWithSignedUrls;
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
      STATUS_CODES.NOT_FOUND,
      "CATEGORY_NOT_FOUND",
      "Category not found with this ID"
    );
  }

  return deletedCategory;
};

export const updateCategoryStatus = async (categoryId, status) => {
  validateObjectId(categoryId);
  if (typeof status !== "boolean") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STATUS",
      "Status must be a boolean value"
    );
  }

  const updateCategory = await Category.findByIdAndUpdate(
    categoryId,
    { isListed: status },
    { new: true, runValidators: true }
  );
  if (!updateCategory) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "CATEGORY_NOT_FOUND",
      "Category not found with this ID"
    );
  }

  return updateCategory;
};

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
  const categoriesWithSignedUrls = await Promise.all(
    categories.map((cat) => enrichCategoryWithSignedUrl(cat))
  );

  return {
    categories: categoriesWithSignedUrls,
    pagination: {
      totalCategories,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCategories / pageSize),
      limit: pageSize,
    },
  };
};

export const getCategoryDetails = async (slug) => {
  if (!slug || typeof slug !== "string") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_SLUG",
      "A valid category slug is required"
    );
  }

  const category = await Category.findOne({ slug, isDeleted: false });
  const categoryWithSignedUrl = enrichCategoryWithSignedUrl(category);

  if (!category) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "CATEGORY_NOT_FOUND",
      "Category not found with this slug"
    );
  }

  return categoryWithSignedUrl;
};
