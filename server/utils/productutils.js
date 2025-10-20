import mongoose from "mongoose";
import { AppError } from "./helpers.js";
import { createSlug } from "./helpers.js";
import Faq from "../models/faqModel.js";

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

export const ensureUniqueSlug = async (title, excludeId = null) => {
  const slug = createSlug(title);
  const query = { slug };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Product.findOne(query);
  if (existing) {
    throw new AppError(
      429,
      "SLUG_ALREADY_EXISTS",
      "A product with this title already exists"
    );
  }

  return slug;
};

export const checkSlugUniqueness = async (
  Model,
  title,
  entityName = "Item",
  excludeId = null
) => {
  const slug = createSlug(title);
  const query = { slug };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Model.findOne(query);
  if (existing) {
    throw new AppError(
      409,
      `${entityName.toUpperCase()}_ALREADY_EXISTS`,
      `Another ${entityName.toLowerCase()} with this title already exists`
    );
  }

  return slug;
};

export const saveFaqs = async (faqs, productId, replaceExisting = false) => {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return [];

  // Delete existing FAQs if replaceExisting is true
  if (replaceExisting) {
    await Faq.deleteMany({ productId });
  }

  const faqsWithProductId = faqs.map((faq) => ({
    ...faq,
    productId,
  }));

  return Faq.insertMany(faqsWithProductId);
};
