import { AppError } from "../../utils/helpers.js";

// validateCreateProduct.js
const validateCreateProduct = (req, res, next) => {
  const errors = [];
  const { product } = req.body;

  if (!product) {
    errors.push("Product data is required.");
  } else {
    if (
      !product.title ||
      typeof product.title !== "string" ||
      product.title.trim() === ""
    ) {
      errors.push("Product title is required and must be a non-empty string.");
    }

    if (
      !product.description ||
      typeof product.description !== "string" ||
      product.description.trim() === ""
    ) {
      errors.push(
        "Product description is required and must be a non-empty string."
      );
    }

    if (
      !product.price ||
      typeof product.price !== "object" ||
      product.price.list === undefined ||
      product.price.list === null ||
      typeof product.price.list !== "number"
    ) {
      errors.push("Product price.list is required and must be a number.");
    }

    if (
      !Array.isArray(product.variants) ||
      product.variants.length === 0 ||
      product.variants.some(
        (variant) =>
          !variant.sku ||
          typeof variant.sku !== "string" ||
          variant.sku.trim() === "" ||
          variant.stock === undefined ||
          variant.stock === null ||
          typeof variant.stock !== "number"
      )
    ) {
      errors.push(
        "Product variants must be a non-empty array with each variant having a non-empty string sku and a number stock."
      );
    }

    if (
      !Array.isArray(product.categoryIds) ||
      product.categoryIds.length === 0
    ) {
      errors.push("Product categoryIds must be a non-empty array.");
    }

    if (
      !Array.isArray(product.cloudinaryImageIds) ||
      product.cloudinaryImageIds.length === 0
    ) {
      errors.push("Product cloudinaryImageIds must be a non-empty array.");
    }

    if (typeof product.isListed !== "boolean") {
      errors.push("Product isListed is required and must be a boolean.");
    }
  }

  if (errors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", errors);
  }

  next(); // Pass control to the next middleware or route handler
};

export default validateCreateProduct;
