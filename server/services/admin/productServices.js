import Product from "../../models/productModel.js";
import { AppError, getPagination, getSortOption } from "../../utils/helpers.js";
import {
  buildProductQuery,
  checkSlugUniqueness,
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
  validateObjectId(productId, "product");

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

  const updatedFaqs = await saveFaqs(faqs, updatedProduct._id, true);
  return { product: updatedProduct, faqs: updatedFaqs };
}

export const getProducts = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;
  const query = await buildProductQuery({ search, category });

  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);

  const [result, totalProducts] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(pageSize),
    Product.countDocuments(query),
  ]);

  return {
    products: result,
    pagination: {
      totalProducts,
      currentpage: pageNumber,
      totalPages: Math.ceil(totalProducts / pageSize),
      limit: pageSize,
    },
  };
};
