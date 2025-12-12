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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: addCategory,
    onSuccess: async () => {
      toast.success("Category added successfully!");

      await queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      navigate("/admin/categories");
    },
  });
};

export const useToggleCategoryList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCategoryList,

    onMutate: async ({ categoryId }) => {
      await queryClient.cancelQueries({ queryKey: [CATEGORIES_QUERY_KEY] });

      const previousData = queryClient.getQueriesData({
        queryKey: [CATEGORIES_QUERY_KEY],
      });

      previousData.forEach(([key, old]) => {
        if (!old || !old.data?.categories) return;

        queryClient.setQueryData(key, {
          ...old,
          data: {
            ...old.data,
            categories: old.data.categories.map((cat) =>
              cat._id === categoryId ? { ...cat, isListed: !cat.isListed } : cat
            ),
          },
        });
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, old]) => {
          queryClient.setQueryData(key, old);
        });
      }
      toast.error(
        error.response?.data?.message ||
          "Failed to update category status. Rolled back."
      );
    },

    onSuccess: (data) => {
      toast.success(data.message || "Category status updated!");
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
