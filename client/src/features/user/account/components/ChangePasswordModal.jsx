import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { changePasswordSchema } from "../profileSchema.js";
import { useChangePassword } from "../userHooks.js";
import FormInput from "../../../../components/common/FormComponents.jsx";
export const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const { mutate, isLoading } = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data) => {
    mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Login Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>

          <FormInput
            id="email"
            label="Email"
            type="email"
            value={userEmail || ""} // Pre-fill email
            disabled // Make it read-only
            className="bg-gray-100" // Style for disabled
          />

          <h3 className="text-lg font-semibold text-gray-800 pt-2 border-t">
            Change Password
          </h3>
          <FormInput
            id="currentPassword"
            label="Current Password"
            type="password"
            {...register("currentPassword")}
            error={errors.currentPassword?.message}
          />
          <FormInput
            id="newPassword"
            label="New Password"
            type="password"
            {...register("newPassword")}
            error={errors.newPassword?.message}
          />
          <FormInput
            id="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            {...register("confirmNewPassword")}
            error={errors.confirmNewPassword?.message}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
