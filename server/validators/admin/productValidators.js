import Joi from "joi";

// Reusable ObjectId validator
const mongoIdSchema = Joi.string().hex().length(24).messages({
  "string.base": "{#label} must be a string",
  "string.hex": "{#label} must be a valid ObjectId",
  "string.length": "{#label} must be 24 characters long",
});

// --- Sub-Schemas for Parsed Data ---
const priceValidationSchema = Joi.object({
  list: Joi.number().min(0).required().messages({
    "number.base": "List price must be a number",
    "number.min": "List price cannot be negative",
    "any.required": "List price is required",
  }),
  sale: Joi.number()
    .min(0)
    .optional()
    .allow(null)
    .less(Joi.ref("list"))
    .messages({
      "number.base": "Sale price must be a number",
      "number.min": "Sale price cannot be negative",
      "number.less": "Sale price cannot be greater than list price",
    }),
});

// Validates variants AFTER SKU is added by the service (if validating there)
// OR validates {size, stock} BEFORE SKU generation
const variantValidationSchema = Joi.object({
  size: Joi.string().trim().required().messages({
    // Make size required per variant
    "string.empty": "Variant size is required",
    "any.required": "Variant size is required",
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Variant stock must be a number",
    "number.integer": "Variant stock must be a whole number",
    "number.min": "Variant stock cannot be negative",
    "any.required": "Variant stock is required",
  }),
  // SKU is typically generated/validated in the service, not here
});

const detailValidationSchema = Joi.object({
  attribute: Joi.string().trim().required().messages({
    "string.empty": "Detail attribute cannot be empty",
    "any.required": "Detail attribute is required",
  }),
  description: Joi.string().trim().required().messages({
    "string.empty": "Detail description cannot be empty",
    "any.required": "Detail description is required",
  }),
});

const faqValidationSchema = Joi.object({
  question: Joi.string().trim().required().messages({
    "string.empty": "FAQ question cannot be empty",
    "any.required": "FAQ question is required",
  }),
  answer: Joi.string().trim().required().messages({
    "string.empty": "FAQ answer cannot be empty",
    "any.required": "FAQ answer is required",
  }),
});

// --- Main Validation Schema for Parsed Product Data ---
export const parsedProductDataSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Product title is required",
    "string.min": "Product title must be at least 3 characters",
    "string.max": "Product title cannot exceed 100 characters",
    "any.required": "Product title is required",
  }),
  // Slug is generated/validated in service
  description: Joi.string().trim().max(2000).allow("").optional().messages({
    // Allow empty, optional
    "string.max": "Description cannot exceed 2000 characters",
  }),
  shortDescription: Joi.string().trim().max(500).allow("").optional().messages({
    // Allow empty, optional
    "string.max": "Short description cannot exceed 500 characters",
  }),
  price: priceValidationSchema.required().messages({
    "any.required": "Price information is required",
  }),
  variants: Joi.array()
    .items(variantValidationSchema)
    // .min(1) // Ensure at least one has stock is better handled in Zod/Service logic
    .required() // Array itself is required
    .messages({
      "array.base": "Variants must be an array",
      "any.required": "Product variants are required",
    }),
  categoryIds: Joi.array()
    .items(mongoIdSchema.label("Category ID"))
    .min(1)
    .required()
    .messages({
      "array.base": "Category IDs must be an array",
      "array.min": "At least one category is required",
      "any.required": "Category IDs are required",
    }),
  // imageIds are added by the service after S3 upload, not validated here
  details: Joi.array().items(detailValidationSchema).optional().messages({
    "array.base": "Details must be an array of attribute/description pairs",
  }),
  tags: Joi.array().items(Joi.string().trim()).max(10).optional().messages({
    "array.base": "Tags must be an array of strings",
    "array.max": "Cannot have more than 10 tags",
  }),
  isListed: Joi.boolean().required().messages({
    // Required from frontend
    "boolean.base": "Listing status must be true or false",
    "any.required": "Listing status is required",
  }),
  // rating, isDeleted, slug, imageIds, timestamps are handled by Mongoose/Service
});

// --- Schema for Parsed FAQ Data ---
export const parsedFaqsDataSchema = Joi.array()
  .items(faqValidationSchema)
  .optional()
  .messages({
    "array.base": "FAQs must be an array",
  });
