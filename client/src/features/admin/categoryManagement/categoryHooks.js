import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCategory,
  deleteCategory,
  getCategories,
  toggleCategoryList,
} from "./categoryApis.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const CUSTOMER_STATS_QUERY_KEY = "customerStats";
export const CATEGORIES_QUERY_KEY = "categories";

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
