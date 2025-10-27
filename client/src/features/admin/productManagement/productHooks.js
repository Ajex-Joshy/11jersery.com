import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProducts,
  toggleProductList,
  deleteProduct,
  getAllCategories,
  addProduct,
} from "./productApis.js";

import { CATEGORIES_QUERY_KEY } from "../categoryManagement/categoryHooks.js";
import { useNavigate } from "react-router-dom";

export const PRODUCTS_QUERY_KEY = "products";

/**
 * Hook to fetch paginated/filtered products.
 */
export const useProducts = (params) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, params],
    queryFn: getProducts,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch all category names for filters.
 */
export const useAllCategories = () => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, "all"],
    queryFn: getAllCategories,
    staleTime: Infinity, // Category names rarely change, cache forever
  });
};

// --- Mutation Hooks ---

export const useToggleProductList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleProductList,
    onSuccess: async (data) => {
      toast.success(data.message || "Product status updated!");
      await queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update product status."
      );
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async (data) => {
      toast.success(data.message || "Product deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product.");
    },
  });
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: addProduct,
    onSuccess: (data) => {
      toast.success(data.message || "Product added successfully!");
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      navigate("/admin/products"); // Navigate to product list
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add product.");
    },
  });
};
