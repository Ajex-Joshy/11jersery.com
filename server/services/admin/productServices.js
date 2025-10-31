import Faq from "../../models/faqModel.js";
import Product from "../../models/productModel.js";
import Review from "../../models/reviewModel.js";
import { AppError, getPagination, getSortOption } from "../../utils/helpers.js";
import {
  buildProductQuery,
  checkSlugUniqueness,
  saveFaqs,
  validateObjectId,
} from "../../utils/productutils.js";
import { updateFaqs } from "./queryHelpers.js";
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

export const updateProductBySlug = async (
  slug,
  productUpdateData,
  faqsUpdateData,
  files
) => {
  // 1. Find the existing product by slug
  const existingProduct = await Product.findOne({
    slug: slug,
    isDeleted: false,
  });
  if (!existingProduct) {
    throw createError(404, "Product not found with the given slug");
  }

  // 2. Handle Image Uploads (if new files provided)
  let newImageUrls = [];
  if (files && files.length > 0) {
    try {
      const uploadPromises = files.map((file) => uploadFileToS3(file));
      newImageUrls = await Promise.all(uploadPromises);
      // Replace existing images with the new ones.
      // Use coverImageIndex from productUpdateData to reorder if necessary.
      const coverIndex = productUpdateData.coverImageIndex ?? 0;
      if (coverIndex > 0 && coverIndex < newImageUrls.length) {
        const coverUrl = newImageUrls.splice(coverIndex, 1)[0];
        newImageUrls.unshift(coverUrl);
      } else if (newImageUrls.length > 0 && coverIndex >= newImageUrls.length) {
        console.warn(
          `Invalid coverImageIndex (${coverIndex}) received during update. Defaulting to first image.`
        );
      }
      // Add the final ordered URLs to the update payload
      productUpdateData.imageIds = newImageUrls;
    } catch (s3Error) {
      console.error("S3 Upload Error during product update:", s3Error);
      throw createError(500, "Failed to upload new product images.");
    }
  }
  // Remove coverImageIndex from the data to be saved in DB
  delete productUpdateData.coverImageIndex;

  // 3. Handle Slug Update (if title changed)
  if (
    productUpdateData.title &&
    productUpdateData.title !== existingProduct.title
  ) {
    const newSlug = await checkSlugUniqueness(
      Product,
      productUpdateData.title,
      "Product",
      existingProduct._id // Pass existing ID to exclude self
    );
    productUpdateData.slug = newSlug;
  } else {
    // Don't modify slug if title hasn't changed
    delete productUpdateData.slug;
  }

  // 4. Handle Variants/SKUs
  if (productUpdateData.variants) {
    productUpdateData.variants = productUpdateData.variants.map((variant) => ({
      ...variant,
      sku:
        variant.sku ||
        `${(productUpdateData.title || existingProduct.title)
          .substring(0, 3)
          .toUpperCase()}-${variant.size}`,
    }));
  }
  // 5. Update Product in DB using the found product's ID
  const updatedProduct = await Product.findByIdAndUpdate(
    existingProduct._id,
    { $set: productUpdateData }, // Use $set to only update provided fields
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    // This check might be redundant if findOne succeeded, but good practice
    throw createError(500, "Failed to update product after finding it.");
  }

  // 6. Update FAQs
  // Pass the full array from the form and the product ID.
  // The `updateFaqs` function should handle finding, updating, creating, or deleting FAQs.
  const updatedFaqs = await updateFaqs(
    faqsUpdateData || [],
    updatedProduct._id
  );

  return { product: updatedProduct, faqs: updatedFaqs };
};

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

export const getProductDetails = async (slug) => {
  const product = await Product.findOne({ slug });

  if (!product)
    throw new AppError(404, "PRODUCT_NOT_FOUND", "Product not found");
  const faqs = await Faq.find({ productId: product._id });

  return { product, faqs };
};

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
