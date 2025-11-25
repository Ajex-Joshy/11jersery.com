import Category from "../../models/category.model.js";
import Faq from "../../models/faq.model.js";
import Product from "../../models/product.model.js";
import Review from "../../models/review.model.js";
import { AppError, getPagination, getSortOption } from "../../utils/helpers.js";
import {
  buildProductQuery,
  enrichProductWithSignedUrls,
} from "../../utils/product.utils.js";

export const getProductDetailsService = async (productSlug) => {
  const product = await Product.findOne({
    slug: productSlug,
    isListed: true,
    isDeleted: false,
  }).lean();

  if (!product) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      `Product with slug "${productSlug}" not found`
    );
  }
  const productsWithSignedUrls = await enrichProductWithSignedUrls(product);

  const reviews = await Review.find({ productId: product._id })
    .select("_id rating userName place comment createdAt productId")
    .sort({ createdAt: -1 })
    .lean();

  const otherProducts = await Product.find({
    categoryIds: { $in: product.categoryIds },
    _id: { $ne: product._id },
    isListed: true,
    isDeleted: false,
  })
    .select("_id title slug price rating cloudinaryImageId")
    .limit(4)
    .lean();

  return {
    product: productsWithSignedUrls,
    reviews,
    otherProducts,
  };
};

export const getProductFaqs = async (slug) => {
  const product = await Product.findOne({
    slug,
    isListed: true,
    isDeleted: false,
  }).lean();

  if (!product) {
    throw new AppError(
      404,
      "PRODUCT_NOT_FOUND",
      `Product with slug "${slug}" not found`
    );
  }
  const faqs = await Faq.find({ productId: product._id });
  return faqs;
};

const getFilterMetadata = async (baseQuery) => {
  const [clubs, sizes, price] = await Promise.all([
    Product.aggregate([
      { $match: baseQuery },
      { $unwind: "$categoryIds" },
      {
        $group: {
          _id: "$categoryIds",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          _id: 0,
          name: "$categoryDetails.title",
          slug: "$categoryDetails.slug",
          count: "$count",
        },
      },
    ]),

    Product.aggregate([
      { $match: baseQuery },
      { $unwind: "$variants" },
      { $group: { _id: "$variants.size" } },
      { $sort: { _id: 1 } },
    ]).then((results) => results.map((r) => r._id)),

    Product.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price.sale" },
          maxPrice: { $max: "$price.sale" },
        },
      },
    ]).then((results) => ({
      starts: results[0]?.minPrice || 0,
      ends: results[0]?.maxPrice || 1000,
    })),
  ]);

  return {
    availableClubs: clubs,
    availableSizes: sizes,
    priceRange: price,
  };
};

/**
 * Fetches products AND the metadata (filters, sorting) for the product listing page.
 */
export const getProducts = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    size = "",
    minPrice = "",
    maxPrice = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  // This query is used to find filter metadata
  const baseQuery = await buildProductQuery({
    search,
    category,
  });

  // This query is used to get the actual products
  const finalQuery = await buildPr;

  oductQuery({
    search,
    category,
    size,
    minPrice,
    maxPrice,
  });

  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);
  const categoryTitle = category
    ? (await Category.findOne({ slug: category }))?.title
    : "All Products";

  const [products, totalProducts, filterMetadata] = await Promise.all([
    Product.find(finalQuery)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select("_id title slug price rating imageIds"),

    Product.countDocuments(finalQuery),

    getFilterMetadata(baseQuery),
  ]);
  const productsWithSignedUrls = await Promise.all(
    products.map((product) => enrichProductWithSignedUrls(product))
  );

  const response = {
    metadata: {
      pagination: {
        totalProducts: totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / pageSize),
        limit: pageSize,
      },
      filters: {
        availableClubs: filterMetadata.availableClubs,
        availableSizes: filterMetadata.availableSizes,
        priceRange: filterMetadata.priceRange,
      },
      sorting: {
        currentSort: sortBy,
        availableSorts: [
          { key: "createdAt", label: "Most Popular" },
          { key: "price.sale-asc", label: "Price: Low to High" },
          { key: "price.sale-desc", label: "Price: High to Low" },
          { key: "rating-desc", label: "Rating" },
        ],
      },
    },
    data: {
      categoryTitle: categoryTitle,
      products: productsWithSignedUrls,
    },
  };

  return response;
};
