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
import { cloneCart, recalcTotals } from "./cartUtils";
import { useCartOptimisticMutation } from "./useCartOptimisticMutation";
import { MAX_QUANTITY_PER_ORDER } from "../../../utils/constants";

export const CART_KEY = "Cart";

export const useCart = () => {
  return useQuery({
    queryKey: [CART_KEY],
    queryFn: () => getCart(),
    staleTime: 1000 * 60 * 5,
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
export const useIncrementItem = () =>
  useCartOptimisticMutation(
    incrementItem,
    (cart, { itemId }) => {
      if (!cart) return cart;
      const updated = cloneCart(cart);
      const item = updated.data.items.find((i) => i._id === itemId);
      if (item) {
        if (item.quantity >= MAX_QUANTITY_PER_ORDER) {
          toast.error("Maximum quantity per order is 20");
          return cart;
        }
        item.quantity += 1;
      }
      return recalcTotals(updated);
    },
    {
      onError: (err) => {
        toast.error(
          err?.response?.data?.error?.message || "Something went wrong"
        );
      },
    }
  );

export const useDecrementItem = () =>
  useCartOptimisticMutation(
    decrementItem,
    (cart, { itemId }) => {
      if (!cart) return cart;
      const updated = cloneCart(cart);
      const item = updated.data.items.find((i) => i._id === itemId);
      if (item && item.quantity > 1) item.quantity -= 1;
      return recalcTotals(updated);
    },
    {
      onError: (err) => {
        toast.error(
          err?.response?.data?.error?.message || "Something went wrong"
        );
      },
    }
  );

export const useRemoveItemFromCart = () =>
  useCartOptimisticMutation(
    removeItemFromCart,
    (cart, { itemId }) => {
      if (!cart) return cart;
      const updated = cloneCart(cart);
      updated.data.items = updated.data.items.filter((i) => i._id !== itemId);
      return recalcTotals(updated);
    },
    {
      onError: (err) => {
        toast.error(
          err?.response?.data?.error?.message || "Something went wrong"
        );
      },
    }
  );

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
