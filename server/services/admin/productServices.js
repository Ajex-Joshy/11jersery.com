import Product from "../../models/productModel.js";
import { AppError, getPagination, getSortOption } from "../../utils/helpers.js";
import {
  buildProductQuery,
  checkSlugUniqueness,
  saveFaqs,
  validateObjectId,
} from "../../utils/productutils.js";
import { uploadFileToS3 } from "./s3Service.js";

export async function addProduct(productDataString, faqsDataString, files) {
  const productInfo = productDataString;
  const faqs = faqsDataString;

  if (!files || files.length === 0) {
    throw new Error("At least one product image is required.");
  }

  const uploadPromises = files.map((file) => uploadFileToS3(file));
  const imageUrls = await Promise.all(uploadPromises); // Get all S3 URLs

  const slug = await checkSlugUniqueness(Product, productInfo.title, "Product");

  const variantsWithSku = productInfo.variants.map((variant) => ({
    ...variant,
    sku: `${productInfo.title.substring(0, 3).toUpperCase()}-${variant.size}`,
  }));

  const newProductData = {
    title: productInfo.title,
    slug: slug,
    description: productInfo.description,
    shortDescription: productInfo.shortDescription,
    price: {
      list: productInfo.price.list,
      sale: productInfo.price.sale,
    },
    variants: variantsWithSku,
    categoryIds: productInfo.categoryIds,
    tags: productInfo.tags,
    isListed: productInfo.isListed,
    imageIds: imageUrls,
    details: productInfo.details || [],
  };

  // 6. Create the Product in MongoDB
  const savedProduct = await Product.create(newProductData);

  // 7. Save FAQs (assuming saveFaqs handles an array)
  let savedFaqs = [];
  if (faqs && faqs.length > 0) {
    savedFaqs = await saveFaqs(faqs, savedProduct._id);
  }

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
    status = "",
    category,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;
  const query = await buildProductQuery({ search, category, status });

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
