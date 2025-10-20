import mongoose from "mongoose";
import { AppError } from "./helpers.js";
import { createSlug } from "./helpers.js";

export const validateObjectId = (id, entity = "Category") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "INVALID_ID", `Provided ${entity} ID is invalid`);
  }
};

export const checkDuplicateSlug = async (title, excludeId = null) => {
  const slug = createSlug(title);
  const existing = await Category.findOne({
    slug,
    ...(excludeId && { _id: { $ne: excludeId } }),
  });

  if (existing) {
    throw new AppError(
      409,
      "CATEGORY_ALREADY_EXISTS",
      "Another category with this title already exists"
    );
  }

  return slug;
};
