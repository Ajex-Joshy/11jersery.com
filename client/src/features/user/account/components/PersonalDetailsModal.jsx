import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { personalDetailsSchema } from "../profileSchema.js";
import { useUpdateProfile } from "../userHooks";
import AvatarUploader from "../../../../components/common/AvatarUploader.jsx";
import { FormInput } from "../../../../components/common/FormComponents.jsx";
import toast from "react-hot-toast";
// Helper component for Date of Birth
const DateOfBirthFields = ({ control }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Apr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Aug" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  return (
    <div className="grid grid-cols-3 gap-3">
      <Controller
        name="dob_year"
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className="border border-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      />
      <Controller
        name="dob_month"
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className="border border-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Month</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        )}
      />
      <Controller
        name="dob_day"
        control={control}
        render={({ field }) => (
          <select
            {...field}
            className="border border-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        )}
      />
    </div>
  );
};

export const PersonalDetailsModal = ({ isOpen, onClose, user }) => {
  const { mutate, isLoading } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(personalDetailsSchema),
  });

  // Populate form with user data when modal opens or user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "", // Add phone
        // DOB and Gender would be populated here if they exist on `user`
        // dob_day: user.dob ? user.dob.split('-')[2] : "",
        // dob_month: user.dob ? user.dob.split('-')[1] : "",
        // dob_year: user.dob ? user.dob.split('-')[0] : "",
        // gender: user.gender || "",
        image: null, // Always start with no *new* file
      });
    }
  }, [user, isOpen, reset]);

  const onSubmit = (data) => {
    const formData = new FormData();
    const changedFields = {}; // Only send changed fields

    // Compare with original data
    if (data.firstName !== user.firstName)
      changedFields.firstName = data.firstName;
    if (data.lastName !== user.lastName) changedFields.lastName = data.lastName;
    if (data.phone !== user.phone) changedFields.phone = data.phone;
    // Add DOB/Gender logic here

    // Append changed text fields
    Object.keys(changedFields).forEach((key) => {
      formData.append(key, changedFields[key]);
    });

    // Append new image file if selected
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    // Only submit if something actually changed
    if (Object.keys(changedFields).length > 0 || data.image instanceof File) {
      mutate(formData, {
        onSuccess: () => onClose(), // Close modal on success
      });
    } else {
      toast("No changes detected.");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Personal Details
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
          </div>

          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <AvatarUploader
                onChange={field.onChange}
                value={field.value}
                initialImageUrl={user?.imageId}
              />
            )}
          />

          <FormInput
            id="firstName"
            label="First Name"
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <FormInput
            id="lastName"
            label="Last Name"
            {...register("lastName")}
            error={errors.lastName?.message}
          />

          {/* Add Phone Number from your Figma */}
          <FormInput
            id="phone"
            label="Phone Number"
            type="tel"
            {...register("phone")}
            error={errors.phone?.message}
          />

          {/* Gender Radios from Figma */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Gender
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  {...register("gender")}
                  value="male"
                  className="form-radio"
                />{" "}
                Male
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  {...register("gender")}
                  value="female"
                  className="form-radio"
                />{" "}
                Female
              </label>
            </div>
            {errors.gender && (
              <span className="text-red-600 text-xs mt-1">
                {errors.gender.message}
              </span>
            )}
          </div>

          {/* DOB Dropdowns from Figma */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Date of Birth
            </label>
            <DateOfBirthFields control={control} errors={errors} />
          </div>

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
