import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginUser, signupUser } from "./authApis";
import { setAuthModalView, setUser } from "./authSlice";
import { requestPasswordReset, resetPassword } from "./authApis";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const dispatch = useDispatch(); // Get dispatch function

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
        error.response?.data?.message || "Login failed. Check credentials."
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
      // Dispatch action to switch modal view
      //   dispatch(setAuthModalView("login"));
      if (data) {
        dispatch(setUser(data.data));
      } else {
        toast.error(data.message || "Login successful, but no token received.");
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
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
        error.response?.data?.message || "Failed to send reset link."
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
      toast.success(data.message || "Password reset successfully!");
      navigate("/"); // Go to homepage
      openLoginModal(); // Open the login modal
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Invalid or expired token.");
    },
  });
};
