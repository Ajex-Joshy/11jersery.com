import Product from "../../../../models/product.model.js";
import { STATUS_CODES } from "../../../../utils/constants.js";
import { AppError } from "../../../../utils/helpers.js";

export const restoreStock = async (session, productId, size, quantity) => {
  return Product.updateOne(
    { _id: productId, "variants.size": size },
    { $inc: { "variants.$.stock": quantity } }
  ).session(session);
};

export const reduceStock = async (session, productId, size, quantity) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      variants: {
        $elemMatch: {
          size: size,
          stock: { $gte: quantity },
        },
      },
    },
    {
      $inc: { "variants.$.stock": -quantity },
    },
    { new: true, session }
  );
  if (!product) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INSUFFICIENT_STOCK",
      "Insufficient stock available"
    );
  }

  return product;
};

export const restoreAllStock = async (session, items) => {
  try {
    const restoreOperations = items.map((item) => {
      return restoreStock(session, item.productId, item.size, item.quantity);
    });

    await Promise.all(restoreOperations);
  } catch (error) {
    throw error;
  }
};
