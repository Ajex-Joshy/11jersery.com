import Category from "../../models/categoryModel.js";
import { AppError } from "../../utils/helpers.js";
import { createSlug } from "../../utils/helpers.js";
import mongoose from "mongoose";

export const createCategory = async (categoryData) => {
  const slug = createSlug(categoryData.title);

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new AppError(
      429,
      "CATEGORY_ALREADY_EXISTS",
      "Category with this slug already exists"
    );
  }

  const category = await Category.create({
    ...categoryData,
    slug,
  });
  return category;
};

export const updateCategory = async (categoryId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError(
      400,
      "INVALID_CATEGORY_ID",
      "Provided category ID is invalid"
    );
  }

  if (updateData.title) {
    const slug = createSlug(updateData.title);
    const existing = await Category.findOne({ slug, _id: { $ne: categoryId } });
    if (existing) {
      throw new AppError(
        409,
        "CATEGORY_ALREADY_EXISTS",
        "Another category with this title already exists"
      );
    }
    updateData.slug = slug;
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
