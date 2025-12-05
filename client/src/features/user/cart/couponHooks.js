import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyCouponCode, removeCouponCode } from "./couponApis";
import { toast } from "react-hot-toast";
import { CART_KEY } from "./cartHooks";

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyCouponCode,
    onSuccess: (data) => {
      console.log("data", data);
      toast.success("Coupon applied!");
      queryClient.invalidateQueries([CART_KEY]);
    },
    onError: (err) => {
      console.log("err", err);
      const msg = err?.response?.data?.error?.message || "Invalid Coupon";
      toast.error(msg);
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCouponCode,
    onSuccess: () => {
      toast.success("Coupon removed");
      queryClient.invalidateQueries([CART_KEY]);
    },
  });
};
