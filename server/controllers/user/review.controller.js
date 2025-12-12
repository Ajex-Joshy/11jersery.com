import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
} from "../../services/user/review.service.js";

export const createReviewController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, userName, place, rating, comment } = req.body;

  if (!productId || !rating) {
    throw new Error("Product ID and rating are required");
  }

  const review = await createReview({
    userId,
    productId,
    userName,
    place,
    rating,
    comment,
  });

  sendResponse(res, {
    payload: review,
  });
});

export const getReviewsByProductController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 5 } = req.query;

  if (!productId) {
    throw new Error("Product ID is required");
  }

  const data = await getReviewsByProduct(
    productId,
    Number(page),
    Number(limit)
  );

  sendResponse(res, data);
});

export const deleteReviewController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { reviewId } = req.params;

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  await deleteReview(reviewId, userId);

  sendResponse(res, {
    message: "Review deleted successfully",
  });
});
