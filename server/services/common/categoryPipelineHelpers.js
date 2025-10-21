import { getPagination, getSortOption } from "../../utils/helpers.js";

export const buildProductFacet = (skip, pageSize, productSort) => {
  return {
    $facet: {
      paginatedResults: [
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            rating: 1,
            cloudinaryImageId: 1,
            price: 1,
          },
        },
        { $sort: productSort },
        { $skip: skip },
        { $limit: pageSize },
      ],
      totalCount: [{ $count: "count" }],
    },
  };
};

export const buildProductLookupPipeline = ({
  search = "",
  page = 1,
  limit = 10,
  productSortBy = "createdAt",
  productSortOrder = "desc",
}) => {
  const { pageSize, skip } = getPagination(page, limit);
  const productSort = getSortOption(productSortBy, productSortOrder);

  return [
    {
      $lookup: {
        from: "products",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$$categoryId", "$categoryIds"] },
              isDeleted: false,
              isListed: true,
              ...(search && { title: { $regex: search, $options: "i" } }),
            },
          },
          buildProductFacet(skip, pageSize, productSort, search),
          {
            $addFields: {
              products: "$paginatedResults",
              totalProducts: { $arrayElemAt: ["$totalCount.count", 0] },
            },
          },
          {
            $project: {
              paginatedResults: 0,
              totalCount: 0,
            },
          },
        ],
        as: "products",
      },
    },
  ];
};

export const buildPaginationAddFields = (pageNumber, pageSize) => {
  return {
    $addFields: {
      products: { $arrayElemAt: ["$products.products", 0] },
      pagination: {
        totalProducts: {
          $ifNull: [{ $arrayElemAt: ["$products.totalProducts", 0] }, 0],
        },
        pageNumber,
        pageSize,
        totalPages: {
          $ceil: {
            $divide: [
              {
                $ifNull: [{ $arrayElemAt: ["$products.totalProducts", 0] }, 0],
              },
              pageSize,
            ],
          },
        },
      },
    },
  };
};
