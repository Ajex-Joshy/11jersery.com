import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWishlist, toggleWishlist } from "./wishlistApis";
import toast from "react-hot-toast";

export const WISHLIST_KEY = "wishlist";

export const useWishlist = () => {
  return useQuery({
    queryKey: [WISHLIST_KEY],
    queryFn: getWishlist,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleWishlist,
    onSuccess: (data) => {
      toast.success("Jersey added to wishlist");
      // Invalidate to refetch the list immediately
      queryClient.invalidateQueries({ queryKey: [WISHLIST_KEY] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    },
  });
};
