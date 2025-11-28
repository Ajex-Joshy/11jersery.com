import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "./couponApis";

export const COUPONS_QUERY_KEY = "coupons";

export const useCoupons = (params) => {
  return useQuery({
    queryKey: [COUPONS_QUERY_KEY, params],
    queryFn: () => getCoupons(params),
    keepPreviousData: true,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      toast.success("Coupon created successfully");
      queryClient.invalidateQueries([COUPONS_QUERY_KEY]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create coupon"),
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCoupon,
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      queryClient.invalidateQueries([COUPONS_QUERY_KEY]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update coupon"),
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries([COUPONS_QUERY_KEY]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete coupon"),
  });
};
