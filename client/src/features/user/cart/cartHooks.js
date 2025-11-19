import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  addItemToCart,
  incrementItem,
  decrementItem,
  removeItemFromCart,
  clearCart,
} from "./cartApis";

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
    mutationFn: addItemToCart,
    onSuccess: () => {
      queryClient.invalidateQueries([CART_KEY]);
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
  });
};

export const useDecrementItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: decrementItem,
    onSuccess: () => {
      queryClient.invalidateQueries([CART_KEY]);
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
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries([CART_KEY]);
    },
  });
};
