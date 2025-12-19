import Review from "../../../models/review.model.js";
import { getPagination } from "../../../utils/helpers.js";

const buildReviewQuery = ({ productId, minRating = 3.5 } = {}) => {
  const query = {};
  if (productId) query.productId = productId;
  if (minRating) query.rating = { $gte: minRating };
  return query;
};

export const getPaginatedReviews = async ({
  page = 1,
  limit = 5,
  minRating,
} = {}) => {
  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const query = buildReviewQuery({ minRating });
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
