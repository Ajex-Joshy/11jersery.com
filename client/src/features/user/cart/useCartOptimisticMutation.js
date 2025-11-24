import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CART_KEY } from "./cartHooks";

export const useCartOptimisticMutation = (mutationFn, updater) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (payload) => {
      await queryClient.cancelQueries([CART_KEY]);
      const prevCart = queryClient.getQueryData([CART_KEY]);

      queryClient.setQueryData([CART_KEY], (old) => updater(old, payload));
      return { prevCart };
    },
    onError: (err, _, context) => {
      if (context?.prevCart)
        queryClient.setQueryData([CART_KEY], context.prevCart);
      toast.error(
        err?.response?.data?.error?.message || "Something went wrong"
      );
    },
  });
};
