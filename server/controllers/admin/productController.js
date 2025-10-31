import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import {
  addProduct,
  getProductDetails,
  getProducts,
  updateProduct,
  updateProductBySlug,
} from "../../services/admin/productServices.js";
import { getProductFaqs } from "../../services/user/productService.js";

export const createProductController = asyncHandler(async (req, res) => {
  // 1. Get validated data from middleware
  const { productData, faqsData } = req.validatedBody;
  const files = req.files;

  if (!files || files.length === 0) {
    throw createError(400, "At least one product image is required.");
  }

  if (
    productData.coverImageIndex !== undefined &&
    productData.coverImageIndex >= files.length
  ) {
    logger.warn(
      `Invalid coverImageIndex (${productData.coverImageIndex}) for ${files.length} images. Resetting to 0.`
    );
    productData.coverImageIndex = 0;
  }

  // 3. Call the service
  const { product: createdProduct, faqs: savedFaqs } = await addProduct(
    productData,
    faqsData,
    files
  );

  sendResponse(res, {
    statusCode: 201,
    message: "Product added successfully",
    payload: { product: createdProduct, faqs: savedFaqs },
  });
});

export const updateProductController = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { productData, faqsData, imagesToDelete } = req.validatedBody;
  const files = req.files; // New images

  // 2. Validate coverImageIndex against *new* file count
  if (files && files.length > 0 && productData.coverImageIndex !== undefined) {
    if (
      productData.coverImageIndex < 0 ||
      productData.coverImageIndex >= files.length
    ) {
      logger.warn(
        `Invalid coverImageIndex (${productData.coverImageIndex}) for ${files.length} new images. Resetting to 0.`
      );
      productData.coverImageIndex = 0;
    }
  } else if (
    productData.coverImageIndex !== undefined &&
    (!files || files.length === 0)
  ) {
    delete productData.coverImageIndex; // Index is irrelevant if no new files
  }
  const { product: updatedProduct, faqs: updatedFaqs } =
    await updateProductBySlug(
      slug,
      productData,
      faqsData,
      files,
      imagesToDelete
    );

  sendResponse(res, {
    statusCode: 200,
    message: "Product updated successfully",
    payload: { product: updatedProduct, faqs: updatedFaqs },
  });
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

export const getProductDetailsController = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const result = await getProductFaqs(slug);
  sendResponse(res, result);
});
