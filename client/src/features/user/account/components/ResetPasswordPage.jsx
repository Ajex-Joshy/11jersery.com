import React from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "../authHooks";
import FormInput from "../../../../components/common/FormComponents";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get token from URL
  const { mutate, isLoading } = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = (data) => {
    mutate({ token, password: data.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Link to="/" className="absolute top-6 left-6 text-xl font-bold">
        11jersey.com
      </Link>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Set New Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            id="password"
            label="New Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
          <FormInput
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
