import mongoose from "mongoose";
import { AppError } from "../../utils/helpers.js";

const validateProduct = (req, res, next) => {
  const errors = [];

  const product = req.body.product;
  const faqs = req.body.faqs;

  const {
    title,
    description,
    shortDescription,
    price,
    variants,
    categoryIds,
    tags,
    cloudinaryImageIds,
    isListed,
  } = product;

  // Validate title
  if (
    !title ||
    typeof title !== "string" ||
    title.trim().length < 3 ||
    title.trim().length > 100
  ) {
    errors.push("Title is required and must be between 3 and 100 characters.");
  }

  // Validate description
  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 2000) {
      errors.push("Description must be a string with max length 2000.");
    }
  }

  // Validate shortDescription
  if (shortDescription !== undefined) {
    if (typeof shortDescription !== "string" || shortDescription.length > 500) {
      errors.push("Short description must be a string with max length 500.");
    }
  }

  // Validate price
  if (!price || typeof price !== "object") {
    errors.push("Price is required and must be an object.");
  } else {
    if (
      price.list === undefined ||
      typeof price.list !== "number" ||
      price.list < 0
    ) {
      errors.push("List price is required and must be a number >= 0.");
    }
    if (price.sale !== undefined) {
      if (typeof price.sale !== "number" || price.sale < 0) {
        errors.push("Sale price must be a number >= 0.");
      } else if (price.list !== undefined && price.sale > price.list) {
        errors.push("Sale price must be less than or equal to list price.");
      }
    }
  }

  // Validate variants
  if (!Array.isArray(variants)) {
    errors.push("Variants must be an array.");
  } else {
    variants.forEach((variant, index) => {
      if (!variant || typeof variant !== "object") {
        errors.push("Variant must be an object.");
        return;
      }
      if (
        !variant.sku ||
        typeof variant.sku !== "string" ||
        variant.sku.trim() === ""
      ) {
        errors.push("SKU is required and must be a non-empty string.");
      }
      if (variant.size !== undefined && typeof variant.size !== "string") {
        errors.push("Size must be a string if provided.");
      }
      if (
        variant.stock === undefined ||
        typeof variant.stock !== "number" ||
        variant.stock < 0
      ) {
        errors.push("Stock is required and must be a number >= 0.");
      }
    });
  }

  // Validate categoryIds
  if (!Array.isArray(categoryIds)) {
    errors.push("categoryIds must be an array.");
  } else {
    categoryIds.forEach((id, index) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        errors.push("Each categoryId must be a valid Mongo ObjectId.");
      }
    });
  }

  // Validate tags
  if (!Array.isArray(tags)) {
    errors.push("Tags must be an array.");
  } else {
    if (tags.length > 10) {
      errors.push("Tags array must not exceed 10 items.");
    }
    tags.forEach((tag, index) => {
      if (typeof tag !== "string") {
        errors.push("Each tag must be a string.");
      }
    });
  }

  // Validate cloudinaryImageIds
  if (!Array.isArray(cloudinaryImageIds)) {
    errors.push("cloudinaryImageIds must be an array.");
  } else {
    cloudinaryImageIds.forEach((id, index) => {
      if (typeof id !== "string") {
        errors.push("Each cloudinaryImageId must be a string.");
      }
    });
  }

  // Validate isListed
  if (typeof isListed !== "boolean") {
    errors.push("isListed must be a boolean.");
  }

  // Validate faqs (optional)
  if (faqs !== undefined) {
    if (!Array.isArray(faqs)) {
      errors.push("faqs must be an array if provided.");
    } else {
      faqs.forEach((faq, index) => {
        if (!faq || typeof faq !== "object") {
          errors.push("Each faq must be an object.");
          return;
        }
        if (
          !faq.question ||
          typeof faq.question !== "string" ||
          faq.question.trim().length < 5 ||
          faq.question.trim().length > 300
        ) {
          errors.push(
            "Question is required and must be between 5 and 300 characters."
          );
        }
        if (
          !faq.answer ||
          typeof faq.answer !== "string" ||
          faq.answer.trim().length < 5 ||
          faq.answer.trim().length > 2000
        ) {
          errors.push(
            "Answer is required and must be between 5 and 2000 characters."
          );
        }
      });
    }
  }

  if (errors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", errors[0]);
  }

  next();
};

export default validateProduct;
