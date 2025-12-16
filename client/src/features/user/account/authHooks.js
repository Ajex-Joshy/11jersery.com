import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginUser, logout, signupUser } from "./authApis";
import { openAuthModal, setUser } from "./authSlice";
import { requestPasswordReset, resetPassword } from "./authApis";
import { useNavigate } from "react-router-dom";

export const USER_PROFILE_KEY = "user";
export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data) {
        dispatch(setUser(data.data));
      } else {
        toast.error(data.message || "Login successful, but no token received.");
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message ||
          "Login failed. Check credentials."
      );
    },
  });
};

export const useSignup = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      toast.success(data.message || "Signup successful! Happy shopping..");

      if (data) {
        dispatch(setUser(data.data));
      } else {
        toast.error(data.message || "Login successful, but no token received.");
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error.message ||
          "Signup failed. Please try again."
      );
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      toast.success(data.message || "Logout successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error.message ||
          "Logout failed. Please try again."
      );
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast.success(
        data.message || "Reset link sent (if email is registered)."
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to send reset link."
      );
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const openLoginModal = () => dispatch(openAuthModal("login"));

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.dismissAll();
      toast.success(data.message || "Password reset successfully!");
      navigate("/"); // Go to homepage
      openLoginModal(); // Open the login modal
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Invalid or expired token."
      );
    },
  });
};
