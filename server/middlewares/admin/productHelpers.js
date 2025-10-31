import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { validationOptions } from "../../validators/admin/productValidators.js";

/**
 * Parses and validates stringified product data from req.body.
 * Attaches validated data to req.validatedBody
 */
export const parseAndValidateProductData = (schema, type = "product") =>
  asyncHandler(async (req, res, next) => {
    const dataString =
      type === "product" ? req.body.productData : req.body.faqsData;
    const dataKey = type === "product" ? "productData" : "faqsData";

    let parsedData = type === "product" ? {} : []; // Default for product vs faqs

    if (dataString) {
      try {
        parsedData = JSON.parse(dataString);
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw createError(400, `Invalid JSON format for ${dataKey}.`);
        }
        throw parseError;
      }

      // Validate the parsed object
      const { error, value: validatedData } = schema.validate(
        parsedData,
        validationOptions
      );
      if (error) {
        const messages = error.details.map((el) => el.message).join(". ");
        throw createError(
          400,
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } data validation failed: ${messages}`
        );
      }

      // Attach validated data
      if (!req.validatedBody) req.validatedBody = {};
      req.validatedBody[dataKey] = validatedData;
    } else if (type === "product" && req.method === "POST") {
      // productData is required for create
      throw createError(400, "Missing product data.");
    } else if (type === "product") {
      // For PATCH, if productData is not sent, initialize as empty object
      if (!req.validatedBody) req.validatedBody = {};
      req.validatedBody.productData = {};
    }

    if (type === "faqs") {
      // For FAQs, if not provided, set a default empty array
      if (!req.validatedBody) req.validatedBody = {};
      req.validatedBody.faqsData = parsedData; // Will be [] if faqsDataString was null
    }

    next();
  });

/**
 * Parses the imagesToDelete string from req.body.
 * Attaches it to req.validatedBody.imagesToDelete
 */
export const parseImagesToDelete = asyncHandler(async (req, res, next) => {
  if (req.body.imagesToDeleteString) {
    // Assuming frontend sends 'imagesToDeleteString'
    try {
      const imagesToDelete = JSON.parse(req.body.imagesToDeleteString);
      if (!Array.isArray(imagesToDelete)) {
        throw createError(
          400,
          "'imagesToDelete' must be an array of image identifiers."
        );
      }
      if (!req.validatedBody) req.validatedBody = {};
      req.validatedBody.imagesToDelete = imagesToDelete;
    } catch (parseError) {
      throw createError(400, "Invalid JSON format for imagesToDelete.");
    }
  } else {
    if (!req.validatedBody) req.validatedBody = {};
    req.validatedBody.imagesToDelete = [];
  }
  next();
});
