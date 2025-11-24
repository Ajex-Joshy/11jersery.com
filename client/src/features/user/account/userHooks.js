import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updatePersonalDetails,
  updatePassword,
  requestEmailOtp,
  verifyEmailOtp,
} from "./userApis";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "./authSlice";
export const USER_PROFILE_KEY = ["userProfile"];

export const useUserProfile = () => {
  return useQuery({
    queryKey: USER_PROFILE_KEY,
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 15,
  });
};

export const useUpdatePersonalDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePersonalDetails,
    onMutate: async (newDetails) => {
      await queryClient.cancelQueries(USER_PROFILE_KEY);
      const previousData = queryClient.getQueryData(USER_PROFILE_KEY);
      queryClient.setQueryData(USER_PROFILE_KEY, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ...newDetails,
          },
        };
      });
      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(USER_PROFILE_KEY, context.previousData);
      }
      toast.error(
        error?.response?.data?.error?.message || "Failed to update details"
      );
    },
    onSuccess: (data) => {
      toast.success("Personal details updated successfully");
      queryClient.setQueryData(USER_PROFILE_KEY, data?.json);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to update password"
      );
    },
  });
};

export const useRequestEmailOtp = () => {
  return useMutation({
    mutationFn: requestEmailOtp,
    onSuccess: () => {
      toast.success("OTP sent to your new email");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to send OTP"
      );
    },
  });
};

export const useVerifyEmailOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyEmailOtp,
    onSuccess: () => {
      toast.success("Email updated successfully");
      queryClient.invalidateQueries(USER_PROFILE_KEY);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error?.response?.data?.error?.message || "Invalid OTP");
    },
  });
};

export const useRequestEmailChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyEmailOtp,
    onSuccess: () => {
      toast.success("Email updated successfully");
      queryClient.invalidateQueries(USER_PROFILE_KEY);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error?.message || "Invalid OTP");
    },
  });
};
export const useConfirmEmailChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyEmailOtp,
    onSuccess: () => {
      toast.success("Email updated successfully");
      queryClient.invalidateQueries(USER_PROFILE_KEY);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error?.message || "Invalid OTP");
    },
  });
};
