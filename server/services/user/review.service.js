import Product from "../../models/product.model.js";
import Review from "../../models/review.model.js";
import User from "../../models/user.model.js";

export const createReview = async ({ userId, productId, rating, comment }) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("ProductNotFound");
  }

  const existingReview = await Review.findOne({ userId, productId });
  if (existingReview) {
    throw new Error("Duplicate reviews are not allowed");
  }
  const user = await User.findOne({ _id: userId })
    .select("firstName lastName")
    .lean();

  const oldAvg = product.rating.average || 0;
  const oldCount = product.rating.count || 0;

  const newAvg = (oldAvg * oldCount + rating) / (oldCount + 1);

  product.rating.average = newAvg;
  product.rating.count = oldCount + 1;

  await product.save();

  const review = await Review.create({
    userId,
    productId,
    userName: `${user.firstName} ${user.lastName}`,
    rating,
    comment,
  });

  return review;
};

export const getReviewsByProduct = async (productId, page = 1, limit = 5) => {
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ productId }),
  ]);

  return {
    reviews,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: Number(page),
  };
};

export const deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({ _id: reviewId, userId });

  if (!review) {
    throw new Error("ReviewNotFoundOrUnauthorized");
  }

  const product = await Product.findById(review.productId);
  if (!product) {
    throw new Error("ProductNotFound");
  }

  const oldAvg = product.rating.average || 0;
  const oldCount = product.rating.count || 0;

  const newCount = oldCount - 1;

  let newAvg = 0;
  if (newCount > 0) {
    newAvg = (oldAvg * oldCount - review.rating) / newCount;
  }

  product.rating.average = newAvg;
  product.rating.count = newCount;

  await product.save();

  await Review.findByIdAndDelete(reviewId);

  return true;
};
