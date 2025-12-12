import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, deleteReview, getReviewsByProduct } from "./reviewApis";

export const REVIEWS_KEY = "productReviews";
export const CREATE_REVIEW_KEY = "createReview";
export const DELETE_REVIEW_KEY = "deleteReview";

export const useProductReviews = (productId, page = 1, limit = 5) => {
  return useQuery({
    queryKey: [REVIEWS_KEY, productId, page, limit],
    queryFn: () => getReviewsByProduct(productId, page, limit),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [CREATE_REVIEW_KEY],
    mutationFn: (payload) => createReview(payload),

    onSuccess: (_, variables) => {
      // variables.productId is expected inside payload
      queryClient.invalidateQueries({
        queryKey: [REVIEWS_KEY, variables.productId],
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Something went wrong"
      );
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [DELETE_REVIEW_KEY],
    mutationFn: (reviewId) => deleteReview(reviewId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REVIEWS_KEY],
      });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Something went wrong"
      );
    },
  });
};
