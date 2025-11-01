import Category from "../../models/category.model.js";
import Faq from "../../models/faq.model.js";
import Product from "../../models/product.model.js";
import Review from "../../models/review.model.js";
import { AppError, getPagination, getSortOption } from "../../utils/helpers.js";
import { buildProductQuery } from "../../utils/product.utils.js";

export const getProductDetailsService = async (productSlug) => {
  // 1. Fetch product details by slug
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
  // 2. Fetch reviews for the product

  const reviews = await Review.find({ productId: product._id }) // productId: product._id
    .select("_id rating userName place comment createdAt productId")
    .sort({ createdAt: -1 })
    .lean();

  // 3. Fetch up to 4 other products from the same category
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
    product,
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

// Helper function to get filter aggregations
const getFilterMetadata = async (baseQuery) => {
  // We run these queries in parallel
  const [clubs, sizes, price] = await Promise.all([
    // 1. Get available clubs/categories (based on the base query)
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
          // Join with categories collection to get names
          from: "categories", // The name of your categories collection
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

    // 2. Get all unique available sizes
    Product.aggregate([
      { $match: baseQuery },
      { $unwind: "$variants" },
      { $group: { _id: "$variants.size" } },
      { $sort: { _id: 1 } },
    ]).then((results) => results.map((r) => r._id)), // Return array of strings: ["L", "M", "S"]

    // 3. Get the min/max price range
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
    category = "", // Category slug
    size = "", // Comma-separated sizes: "S,M"
    minPrice = "",
    maxPrice = "",
    sortBy = "createdAt", // Corresponds to 'most-popular' etc.
    sortOrder = "desc",
    status = "",
  } = queryParams;

  // 1. Build the BASE query (what we're searching for, e.g., 'club-jerseys')
  // This query is used to find filter metadata
  const baseQuery = await buildProductQuery({
    search,
    category,
  });

  // 2. Build the FINAL query (base + filters)
  // This query is used to get the actual products
  const finalQuery = await buildProductQuery({
    search,
    category,
    size, // Add size filter
    minPrice, // Add price filter
    maxPrice, // Add price filter
  });

  // 3. Get pagination and sorting options
  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);
  const categoryTitle = category
    ? (await Category.findOne({ slug: category }))?.title
    : "All Products";

  // 4. Run all database queries in parallel
  const [products, totalProducts, filterMetadata] = await Promise.all([
    // Query 1: Get the products for the current page
    Product.find(finalQuery)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select("_id title slug price rating imageIds"),

    // Query 2: Get the total count of products matching the *final* query
    Product.countDocuments(finalQuery),

    // Query 3: Get the filter metadata based on the *base* query
    getFilterMetadata(baseQuery),
  ]);

  // 5. Assemble the final response
  return {
    // METADATA
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
        // You can hard-code this or generate it
        currentSort: sortBy,
        availableSorts: [
          { key: "createdAt", label: "Most Popular" },
          { key: "price.sale-asc", label: "Price: Low to High" },
          { key: "price.sale-desc", label: "Price: High to Low" },
          { key: "rating-desc", label: "Rating" },
        ],
      },
    },
    // DATA
    data: {
      categoryTitle: categoryTitle,
      products: products,
    },
  };
};
