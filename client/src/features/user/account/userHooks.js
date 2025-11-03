import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, changePassword } from "./userApis";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "./authSlice";
export const USER_PROFILE_KEY = ["userProfile"];

/**
 * Hook to fetch the user's profile data.
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: USER_PROFILE_KEY,
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 15,
  });
};

/**
 * Hook to update the user's profile (name, phone, image).
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success(data.message || "Profile updated successfully!");

      // 1. Invalidate the user profile query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEY });

      // 2. Update the user info in the auth slice (updates name in header)
      if (data.token) {
        dispatch(setUser({ token: data.token }));
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    },
  });
};

/**
 * Hook to change the user's password.
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password changed successfully!");
    },
    onError: (error) => {
      // Don't close modal, let user see error
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    },
  });
};
