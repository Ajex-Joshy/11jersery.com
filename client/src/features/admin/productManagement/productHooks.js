import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getProducts,
  toggleProductList,
  deleteProduct,
  getAllCategories,
  addProduct,
  getProductDetails,
  updateProduct,
} from "./productApis.js";

import { CATEGORIES_QUERY_KEY } from "../categoryManagement/categoryHooks.js";
import { useNavigate } from "react-router-dom";

export const PRODUCTS_QUERY_KEY = "products";
export const PRODUCT_DETAILS_KEY = "productDetails";

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

export const useProductDetails = (slug) => {
  return useQuery({
    queryKey: [PRODUCT_DETAILS_KEY, slug],
    queryFn: getProductDetails,
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

    onMutate: async ({ productId }) => {
      await queryClient.cancelQueries({ queryKey: [PRODUCTS_QUERY_KEY] });

      const allQueries = queryClient.getQueriesData({
        queryKey: [PRODUCTS_QUERY_KEY],
      });

      const previousProducts = allQueries;

      allQueries.forEach(([key, oldData]) => {
        if (!oldData || !oldData.data || !oldData.data.products) return;

        queryClient.setQueryData(key, {
          ...oldData,
          data: {
            ...oldData.data,
            products: oldData.data.products.map((product) =>
              product._id === productId
                ? { ...product, isListed: !product.isListed }
                : product
            ),
          },
        });
      });

      return { previousProducts };
    },

    // If mutation fails, rollback
    onError: (error, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          [PRODUCTS_QUERY_KEY],
          context.previousProducts
        );
      }

      toast.error(
        error.response?.data?.error?.message ||
          "Failed to update product status."
      );
    },

    // On success, show toast
    onSuccess: (data) => {
      toast.dismissAll();
      toast.success(data.message || "Product status updated!");
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
      toast.error(
        error.response?.data?.error?.message || "Failed to delete product."
      );
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
      toast.error(
        error.response?.data?.error?.message || "Failed to add product."
      );
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data, variables) => {
      toast.success(data.message || "Product updated successfully!");

      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });

      // Invalidate the specific product details query that was just updated
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_DETAILS_KEY, variables.slug],
      });

      navigate("/admin/products");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to update product."
      );
    },
  });
};
