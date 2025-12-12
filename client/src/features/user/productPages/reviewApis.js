import axiosInstance from "../../../api/axiosInstance";

// Create review
export const createReview = async (payload) => {
  const { data } = await axiosInstance.post("/reviews", payload);
  return data.data;
};

// Delete review
export const deleteReview = async (reviewId) => {
  const { data } = await axiosInstance.delete(`/reviews/${reviewId}`);
  return data.data;
};

// Get reviews for product with pagination
export const getReviewsByProduct = async (productId, page = 1, limit = 5) => {
  const { data } = await axiosInstance.get(`/reviews/${productId}`, {
    params: { page, limit },
  });
  return data.data;
};
