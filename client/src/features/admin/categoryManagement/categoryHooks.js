import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryDetails,
  toggleCategoryList,
  updateCategory,
} from "./categoryApis.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const CUSTOMER_STATS_QUERY_KEY = "customerStats";
export const CATEGORIES_QUERY_KEY = "categories";
export const CATEGORY_DETAILS_KEY = "categoryDetails";

export const useCategories = (params) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, params],
    queryFn: getCategories,
    keepPreviousData: true,

    // Pro-tip: Add a staleTime to prevent unnecessary refetches
    // if the data doesn't change often.
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: addCategory,
    onSuccess: (data) => {
      toast.success(data.data || "Category added successfully!");

      // Invalidate the main category list query so it refetches
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      navigate("/admin/categories");
    },
  });
};

export const useToggleCategoryList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleCategoryList,
    onSuccess: async (data) => {
      toast.success(data.message || "Category status updated!");
      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update category status."
      );
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: async (data) => {
      toast.success(data.message || "Category deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete category."
      );
    },
  });
};

export const useCategoryDetails = (slug) => {
  return useQuery({
    // Key includes the ID so it refetches if the ID changes
    queryKey: [CATEGORY_DETAILS_KEY, slug],
    queryFn: () => getCategoryDetails(slug),
    // Only run the query if categoryId is truthy
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
  });
};

/**
 * Hook for updating a category.
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (data, variables) => {
      // 'variables' holds { slug, formData }
      toast.success(data.message || "Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      // Invalidate the specific details query using the slug
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_DETAILS_KEY, variables.slug],
      });
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update category."
      );
    },
  });
};
