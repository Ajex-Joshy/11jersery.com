import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import {
  addProduct,
  getProducts,
  updateProduct,
} from "../../services/admin/productServices.js";
import {
  parsedProductDataSchema,
  parsedFaqsDataSchema,
} from "../../validators/admin/productValidators.js";

/*
 * Controller to handle adding a new product with image uploads.
 * This runs *after* Multer middleware.
 */
export const createProductController = asyncHandler(async (req, res) => {
  // 1. Multer puts text fields in req.body and files in req.files
  const { productData: productDataString, faqsData: faqsDataString } = req.body;
  const files = req.files; // Expecting an array of file objects from Multer

  // Basic validation
  if (!productDataString || !files || files.length === 0) {
    res.status(400);
    throw new Error("Missing product data or images.");
  }
  // --- Validation Step ---
  let productData;
  let faqsData;

  try {
    // 2. Parse the incoming strings
    productData = JSON.parse(productDataString);
    // Handle optional faqsData, default to empty array if missing/null
    faqsData = faqsDataString ? JSON.parse(faqsDataString) : [];

    // 3. Validate the parsed productData object
    const { error: productError } = parsedProductDataSchema.validate(
      productData,
      {
        abortEarly: false, // Show all errors, not just the first one
        convert: true, // Allow Joi to attempt type conversion (like string to number if possible)
      }
    );
    if (productError) {
      // If validation fails, throw a specific error
      res.status(400); // Bad Request
      // Extract user-friendly error messages
      const messages = productError.details.map((el) => el.message).join(". ");
      throw new Error(`Product data validation failed: ${messages}`);
    }

    // 4. Validate the parsed faqsData array (only if it exists)
    if (faqsData.length > 0) {
      const { error: faqsError } = parsedFaqsDataSchema.validate(faqsData, {
        abortEarly: false,
      });
      if (faqsError) {
        res.status(400);
        const messages = faqsError.details.map((el) => el.message).join(". ");
        throw new Error(`FAQs data validation failed: ${messages}`);
      }
    }
  } catch (parseOrValidationError) {
    // Catch errors from JSON.parse or Joi validation
    if (parseOrValidationError instanceof SyntaxError) {
      res.status(400);
      throw new Error("Invalid JSON data format received.");
    }
    // Re-throw Joi validation errors (already has status code set)
    throw parseOrValidationError;
  }
  // --- End Validation ---

  // 2. Call the updated service with the correct arguments
  const { product: createdProduct, faqs: savedFaqs } = await addProduct(
    productData,
    faqsData || "[]",
    files
  );

  // 3. Send the response
  sendResponse(res, {
    statusCode: 201, // Created
    message: "Product added successfully",
    payload: { product: createdProduct, faqs: savedFaqs },
  });
});
export const updateProductController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const updateData = req.body;

  const { product: updatedProduct, faqs } = await updateProduct(
    productId,
    updateData
  );

  sendResponse(res, { product: updatedProduct, faqs });
});

export const deleteProductController = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { product: updatedProduct } = await updateProduct(productId, {
    product: {
      isDeleted: true,
      isListed: false,
    },
  });

  sendResponse(res, { product: updatedProduct });
});

export const updateProductStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { isListed } = req.body;

  if (typeof isListed !== "boolean") {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "isListed must be a boolean value"
    );
  }

  const { product: updatedProduct } = await updateProduct(productId, {
    product: {
      isListed,
    },
  });

  sendResponse(res, { product: updatedProduct });
});

export const getProductsController = asyncHandler(async (req, res) => {
  const result = await getProducts(req.query);
  sendResponse(res, result);
});
