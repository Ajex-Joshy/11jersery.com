import Joi from "joi";

// const mongoIdSchema = Joi.string().hex().length(24).messages({
//   "string.base": "{#label} must be a string",
//   "string.hex": "{#label} must be a valid ObjectId",
//   "string.length": "{#label} must be 24 characters long",
// });

// --- Base Schema ---
// Make offer fields optional and allow null/empty by default
const categoryBaseSchema = {
  title: Joi.string().trim().min(3).max(30).messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 30 characters",
  }),
  isListed: Joi.boolean().messages({
    "boolean.base": "Listing status must be true or false",
  }),
  inHome: Joi.boolean().default(false).messages({
    "boolean.base": "Homepage display status must be true or false",
  }),
  inCollections: Joi.boolean().default(false).messages({
    "boolean.base": "Collections display status must be true or false",
  }),

  // --- Offer Fields: Optional, allow null/empty ---
  discountType: Joi.string()
    .valid("flat", "percent")
    .allow(null, "") // Allow null or empty string when optional
    .optional()
    .messages({
      "any.only": "Discount type must be either 'flat' or 'percent'",
    }),
  discount: Joi.number().min(0).allow(null, "").optional(),
  minPurchaseAmount: Joi.number().min(0).allow(null, "").optional(),
  maxRedeemable: Joi.number().min(0).allow(null, "").optional(),
};

// --- Schema Options ---
// These options are typically passed directly to the .validate() call
export const validationOptions = {
  abortEarly: false, // Show all errors
  allowUnknown: true, // Allow fields not defined in schema (like _id on update)
  stripUnknown: true, // Remove fields not defined in schema
};

// --- Create Category Schema ---
export const createCategorySchema = Joi.object({
  ...categoryBaseSchema,
  // Make fields required specifically for creation
  title: categoryBaseSchema.title.required().messages({
    "any.required": "Category title is required",
  }),
  isListed: categoryBaseSchema.isListed.required().messages({
    "any.required": "Listing status (isListed) is required",
  }),
})
  // --- Add Conditional Offer Validation ---
  .when(
    // Trigger validation when discount is explicitly provided as a number > 0
    Joi.object({ discount: Joi.number().required().greater(0) }).unknown(),
    {
      // This 'then' block applies ONLY when discount > 0
      then: Joi.object({
        // Require discountType when discount > 0
        discountType: Joi.string()
          .valid("flat", "percent")
          .required()
          .invalid(null, "") // Explicitly disallow null/empty string when required
          .messages({
            "any.required":
              "Discount Type is required when a discount value is set.",
            "any.invalid":
              "Discount Type must be selected when a discount value is set.",
            "any.only": "Discount Type must be 'flat' or 'percent'.",
          }),
      })
        // --- Nested validation based on the required discountType ---
        .when(Joi.object({ discountType: Joi.valid("flat") }).unknown(), {
          // Nested: If type is flat...
          then: Joi.object({
            // Explicitly require discount as a number (overrides base alternatives)
            discount: Joi.number().required().min(0).messages({
              "any.required": "Discount amount is required for flat discount.",
              "number.base": "Discount amount must be a number.",
              "number.min": "Discount amount cannot be negative.",
            }),
            // Explicitly require minPurchaseAmount as a number
            minPurchaseAmount: Joi.number().required().min(0).messages({
              "any.required":
                "Minimum purchase amount is required for flat discount.",
              "number.base": "Minimum purchase amount must be a number.",
              "number.min": "Minimum purchase amount cannot be negative.",
            }),
            // Allow maxRedeemable to be explicitly 0 or null/undefined for flat type
            maxRedeemable: Joi.number().valid(0, null).optional(),
          }),
        })
        .when(Joi.object({ discountType: Joi.valid("percent") }).unknown(), {
          // Nested: If type is percent...
          then: Joi.object({
            // Explicitly require discount as a number (percentage)
            discount: Joi.number().required().min(0).max(100).messages({
              "any.required":
                "Discount percentage is required for percent discount.",
              "number.base": "Discount percentage must be a number.",
              "number.min": "Discount percentage cannot be negative.",
              "number.max": "Discount percentage cannot exceed 100.",
            }),
            // Explicitly require maxRedeemable as a number
            maxRedeemable: Joi.number().required().min(0).messages({
              "any.required":
                "Maximum redeemable amount is required for percent discount.",
              "number.base": "Max redeemable amount must be a number.",
              "number.min": "Max redeemable amount cannot be negative.",
            }),
            // Allow minPurchaseAmount to be explicitly 0 or null/undefined for percent type
            minPurchaseAmount: Joi.number().valid(0, null).optional(),
          }),
        }),
    }
  ); // End of the main .when() for discount > 0

// --- Update Category Schema ---
export const updateCategorySchema = Joi.object({
  ...categoryBaseSchema, // Inherit base fields (all optional by default here)
})
  // --- Add Conditional Offer Validation (same logic structure as create) ---
  .when(
    // Trigger validation when discount is explicitly provided as a number > 0
    Joi.object({ discount: Joi.number().required().greater(0) }).unknown(),
    {
      // This 'then' block applies ONLY when discount > 0
      then: Joi.object({
        // Require discountType when discount > 0
        discountType: Joi.string()
          .valid("flat", "percent")
          .required()
          .invalid(null, "") // Explicitly disallow null/empty string when required
          .messages({
            "any.required":
              "Discount Type is required when a discount value is set.",
            "any.invalid":
              "Discount Type must be selected when a discount value is set.",
            "any.only": "Discount Type must be 'flat' or 'percent'.",
          }),
      })
        // --- Nested validation based on the required discountType ---
        .when(Joi.object({ discountType: Joi.valid("flat") }).unknown(), {
          // Nested: If type is flat...
          then: Joi.object({
            // Explicitly require discount as a number (overrides base alternatives)
            discount: Joi.number().required().min(0).messages({
              "any.required": "Discount amount is required for flat discount.",
              "number.base": "Discount amount must be a number.",
              "number.min": "Discount amount cannot be negative.",
            }),
            // Explicitly require minPurchaseAmount as a number
            minPurchaseAmount: Joi.number().required().min(0).messages({
              "any.required":
                "Minimum purchase amount is required for flat discount.",
              "number.base": "Minimum purchase amount must be a number.",
              "number.min": "Minimum purchase amount cannot be negative.",
            }),
            // Allow maxRedeemable to be explicitly 0 or null/undefined for flat type
            maxRedeemable: Joi.number().valid(0, null).optional(),
          }),
        })
        .when(Joi.object({ discountType: Joi.valid("percent") }).unknown(), {
          // Nested: If type is percent...
          then: Joi.object({
            // Explicitly require discount as a number (percentage)
            discount: Joi.number().required().min(0).max(100).messages({
              "any.required":
                "Discount percentage is required for percent discount.",
              "number.base": "Discount percentage must be a number.",
              "number.min": "Discount percentage cannot be negative.",
              "number.max": "Discount percentage cannot exceed 100.",
            }),
            // Explicitly require maxRedeemable as a number
            maxRedeemable: Joi.number().required().min(0).messages({
              "any.required":
                "Maximum redeemable amount is required for percent discount.",
              "number.base": "Max redeemable amount must be a number.",
              "number.min": "Max redeemable amount cannot be negative.",
            }),
            // Allow minPurchaseAmount to be explicitly 0 or null/undefined for percent type
            minPurchaseAmount: Joi.number().valid(0, null).optional(),
          }),
        }),
    }
  ) // End of the main .when() for discount > 0
  .min(1) // Ensure at least one field is being updated
  .messages({
    "object.min":
      "At least one field (e.g., title, isListed, discount details) is required to update.",
  });

// --- How to use in Controller ---
/*
import { createCategorySchema, updateCategorySchema, validationOptions } from '../validators/admin/categoryValidator.js';

// Inside createCategoryHandler, after parsing:
const { error: validationError, value: validatedData } = createCategorySchema.validate(
    parsedDataFromRequest,
    validationOptions // Pass options
);
// ... handle validationError ...
// Use validatedData

// Inside updateCategoryHandler, after parsing:
const { error: validationError, value: validatedData } = updateCategorySchema.validate(
    parsedDataFromRequest,
    validationOptions // Pass options
);
// ... handle validationError ...
// Use validatedData
*/
