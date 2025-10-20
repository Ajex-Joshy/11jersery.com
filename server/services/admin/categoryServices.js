import Category from "../../models/categoryModel.js";
import { AppError } from "../../utils/helpers.js";
import {
  checkSlugUniqueness,
  validateObjectId,
} from "../../utils/productutils.js";

export const createCategory = async (categoryData) => {
  const slug = await checkSlugUniqueness(
    Category,
    categoryData.title,
    "Category"
  );
  return await Category.create({
    ...categoryData,
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
