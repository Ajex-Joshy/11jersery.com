import Category from "../../models/categoryModel.js";
import { AppError } from "../../utils/helpers.js";
import slugify from "slugify";

export const createCategory = async (categoryData) => {
  const slug = slugify(categoryData.title, {
    lower: true,
    strict: true, // removes special chars
    trim: true,
  });

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
