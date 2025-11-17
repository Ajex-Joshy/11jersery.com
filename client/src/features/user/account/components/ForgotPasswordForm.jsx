// src/features/auth/components/ForgotPasswordForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "../authHooks";
import { setAuthModalView } from "../authSlice";
import { FormInput } from "../../../../components/common/FormComponents";
import { Loader2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const ForgotPasswordForm = () => {
  const { mutateAsync, isLoading } = useForgotPassword();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setErrorMessage("");
    try {
      await mutateAsync(data.email);
      setIsSent(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-2">Forgot Password?</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <FormInput
        id="forgot-email"
        label="Email Address"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      {errorMessage && (
        <p className="text-sm text-red-600 text-center bg-red-50 py-2 rounded-md">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={isLoading || isSent}
        className={`w-full text-white py-3 rounded-md font-semibold flex items-center justify-center shadow-md transition-all duration-300 ${
          isSent
            ? "bg-green-600 cursor-not-allowed"
            : "bg-black hover:bg-gray-800 disabled:opacity-50"
        }`}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isLoading ? "Sending..." : isSent ? "Link Sent" : "Send Reset Link"}
      </button>
      <p className="text-sm text-center text-gray-600 pt-2">
        Remembered your password?{" "}
        <button
          type="button"
          onClick={() => dispatch(setAuthModalView("login"))}
          className="font-medium text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </p>
    </form>
  );
};
export default ForgotPasswordForm;
