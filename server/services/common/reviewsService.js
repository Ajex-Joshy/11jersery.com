import Review from "../../models/reviewModel.js";
import { getPagination } from "../../utils/helpers.js";

export const buildReviewQuery = ({ productId, minRating = 3.5 } = {}) => {
  const query = {};
  if (productId) query.productId = productId;
  if (minRating) query.rating = { $gte: minRating };
  return query;
};

export const getPaginatedReviews = async ({
  productId,
  page = 1,
  limit = 5,
  minRating,
} = {}) => {
  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const query = buildReviewQuery({ productId, minRating });
  const sort = { rating: -1, createdAt: -1 };

  const [reviews, totalReviews] = await Promise.all([
    Review.find(query).sort(sort).skip(skip).limit(pageSize).lean(),
    Review.countDocuments(query),
  ]);

  return {
    reviews,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReviews / pageSize),
      limit: pageSize,
      totalReviews,
    },
  };
};
