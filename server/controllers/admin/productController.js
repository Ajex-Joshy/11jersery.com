import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import {
  addProduct,
  updateProduct,
} from "../../services/admin/productServices.js";

export const createProductController = asyncHandler(async (req, res) => {
  const { product: createdProduct, faqs } = await addProduct(req.body);
  sendResponse(res, { product: createdProduct, faqs });
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
