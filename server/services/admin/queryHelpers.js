export const buildCategoryStockPipeline = (query, sort, skip, pageSize) => [
  { $match: query },
  { $sort: sort },
  { $skip: skip },
  { $limit: pageSize },
  {
    $lookup: {
      from: "products",
      let: { categoryId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $in: ["$$categoryId", "$categoryIds"] },
          },
        },
        // Unwind product variants to access each stock
        { $unwind: "$variants" },
        // Group all variants to calculate total stock and product count
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$variants.stock" },
            productCount: { $sum: 1 },
          },
        },
      ],
      as: "meta",
    },
  },
  {
    $addFields: {
      totalStock: { $ifNull: [{ $first: "$meta.totalStock" }, 0] },
      productCount: { $ifNull: [{ $first: "$meta.productCount" }, 0] },
    },
  },
  { $project: { meta: 0 } },
];
