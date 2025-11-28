import Product from "../../../models/product.model.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import { AppError } from "../../../utils/helpers.js";

export const restoreStock = async (session, productId, size, quantity) => {
  return Product.updateOne(
    { _id: productId, "variants.size": size },
    { $inc: { "variants.$.stock": quantity } }
  ).session(session);
};

export const validateStock = async (productId, size, quantity) => {
  const product = await Product.findById(productId);

  if (!product)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "NOT_FOUND",
      "Product not found"
    );

  const variant = product.variants?.find((v) => v.size === size);
  if (!variant)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "NOT_FOUND",
      `Variant not found for size ${size}`
    );

  if (variant.stock < quantity) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INSUFFICIENT_STOCK",
      `Insufficient stock for ${product.title}`
    );
  }
};

export const reduceStock = async (session, productId, size, quantity) => {
  const result = await Product.updateOne(
    {
      _id: productId,
      "variants.size": size,
      "variants.stock": { $gte: quantity },
    },
    { $inc: { "variants.$.stock": -quantity } }
  ).session(session);
  console.log(result);

  if (result.modifiedCount === 0) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INSUFFICIENT_STOCK",
      "Insufficient stock available"
    );
  }

  return result;
};
