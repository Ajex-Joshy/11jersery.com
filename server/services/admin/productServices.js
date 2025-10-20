import Product from "../../models/productModel.js";
import { AppError } from "../../utils/helpers.js";
import {
  checkSlugUniqueness,
  ensureUniqueSlug,
  saveFaqs,
  validateObjectId,
} from "../../utils/productutils.js";

export async function addProduct(productData) {
  const productInfo = productData.product;
  const faqs = productData.faqs;
  productInfo.slug = await checkSlugUniqueness(
    Product,
    productInfo.title,
    "Product"
  );

  const savedProduct = await Product.create(productInfo);

  let savedFaqs = await saveFaqs(faqs, savedProduct._id);

  return { product: savedProduct, faqs: savedFaqs };
}

export async function updateProduct(productId, updateData) {
  validateObjectId(productId);

  const { product: productInfo = {}, faqs } = updateData;

  if (productInfo.title) {
    productInfo.slug = await checkSlugUniqueness(
      Product,
      productInfo.title,
      "Product"
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: productInfo },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      "Product not found with the given ID"
    );
  }

  const updatedFaqs = await saveFaqs(faqs, updatedProduct._id);
  return { product: updatedProduct, faqs: updatedFaqs };
}
