import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  addItemToCart,
  incrementItem,
  decrementItem,
  removeItemFromCart,
  clearCart,
} from "./cartApis";
import { cloneCart } from "./cartUtils";
import { useCartOptimisticMutation } from "./useCartOptimisticMutation";
import { MAX_QUANTITY_PER_ORDER } from "../../../utils/constants";

export const CART_KEY = "Cart";

export const useCart = () => {
  return useQuery({
    queryKey: [CART_KEY],
    queryFn: () => getCart(),
    staleTime: 1000 * 60 * 5,
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.message ||
          "Failed to fetch cart"
      );
    },
  });
};

export const useAddItemToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const cart = queryClient.getQueryData([CART_KEY]);
      const existingItem = cart?.data?.items?.find(
        (i) => i.productId === payload.productId && i.size === payload.size
      );

      if (existingItem) {
        const newTotal = existingItem.quantity + payload.quantity;
        if (newTotal > MAX_QUANTITY_PER_ORDER) {
          throw new Error(
            `Maximum quantity per item is ${MAX_QUANTITY_PER_ORDER}`
          );
        }
      }

      return addItemToCart(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries([CART_KEY]);
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Something went wrong"
      );
    },
  });
};

export const useIncrementItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: incrementItem,
    onSuccess: () => {
      queryClient.invalidateQueries([CART_KEY]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Something went wrong"
      );
    },
  });
};

export const useDecrementItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decrementItem,
    onSuccess: () => {
      queryClient.invalidateQueries([CART_KEY]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Something went wrong"
      );
    },
  });
};

export const useRemoveItemFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeItemFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries([CART_KEY]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Something went wrong"
      );
    },
  });
};

export const useClearCart = () =>
  useCartOptimisticMutation(
    clearCart,
    (cart) => {
      if (!cart) return cart;
      const updated = cloneCart(cart);
      updated.data.items = [];
      updated.data.totals = {
        subTotal: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 0,
      };
      return updated;
    },
    {
      onError: (err) => {
        toast.error(
          err?.response?.data?.error?.message || "Something went wrong"
        );
      },
    }
  );
