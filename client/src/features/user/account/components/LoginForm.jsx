import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import { loginSchema } from "./authSchemas";
import { useLogin } from "../authHooks"; // Adjust path
import { setAuthModalView } from "../authSlice"; // Adjust path
import { FormInput } from "../../../../components/common/FormComponents";
const LoginForm = () => {
  const { mutate: loginMutate, isLoading } = useLogin();
  const dispatch = useDispatch();

  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "ajex.brototype@gmail.com",
      password: "Ajex@12345",
    },
  });
  console.log(errors);
  const onSubmit = (data) => {
    loginMutate(data, {
      onError: (error) => {
        const message =
          error?.response?.data?.error.message ||
          "An unexpected error occurred. Please try again.";
        setErrorMessage(message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>

      <FormInput
        id="login-email"
        label="Email Address"
        type="email"
        {...register("identifier")}
        error={errors.email?.message}
        placeholder="you@example.com"
        autoComplete="email"
      />

      <FormInput
        id="login-password"
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      <div className="text-right -mt-2">
        <button
          type="button"
          onClick={() => dispatch(setAuthModalView("forgotPassword"))}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {errorMessage && (
        <p className="text-red-600 text-sm text-center font-medium">
          {errorMessage}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      {/* Switch to Sign Up */}
      <p className="text-sm text-center text-gray-600 pt-2">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => dispatch(setAuthModalView("signup"))}
          className="font-medium text-blue-600 hover:underline"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
