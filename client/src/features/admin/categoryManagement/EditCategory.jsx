import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { categorySchema } from "./categorySchema";
import { useCategoryDetails, useUpdateCategory } from "./categoryHooks";
import ImageDropzone from "../../../components/admin/ImageDropZone";
import { sl } from "zod/v4/locales";
import { S3_URL } from "../../../utils/constants";

// --- Reusable FormInput (Copy from AddCategory.jsx or move to common) ---
const FormInput = ({ label, id, error, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      className={`border p-2 rounded-md ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...props}
    />
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);
// ---

const EditCategory = () => {
  const { slug } = useParams(); // Get slug from URL
  const navigate = useNavigate();

  // Fetch existing category data using the slug
  const {
    data: categoryDetailsData,
    isLoading: isLoadingDetails,
    isError,
    error: fetchError,
  } = useCategoryDetails(slug);

  // Get the update mutation hook
  const { mutate: updateMutate, isLoading: isUpdating } = useUpdateCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: "",
      categoryOffer: 0,
      maxRedeemable: 0,
      discountType: "flat",
      isListed: "true",
      isFeatured: false,
      image: null,
    },
  });
  // --- Populate form when data loads ---
  useEffect(() => {
    if (categoryDetailsData?.data) {
      const category = categoryDetailsData.data;
      reset({
        title: category.title,
        categoryOffer: category.discount,
        maxRedeemable: category.maxReedemable,
        discountType: category.discountType,
        isListed: category.isListed ? "true" : "false",
        isFeatured: category.isFeatured,
        // **IMPORTANT**: DO NOT set 'image' here with the URL.
        // The 'image' field in the form is *only* for a NEW File object.
        // We pass the existing URL to the ImageDropzone separately.
      });
    }
  }, [categoryDetailsData, reset]);
  const existingImageUrl =
    S3_URL + `/categories/${categoryDetailsData?.data.imageId}`;

  // --- Handle Form Submission ---
  const onSubmit = (data) => {
    const original = categoryDetailsData?.data;
    const formData = new FormData();

    // Compare each field and append only if changed
    if (data.title !== original.title) {
      formData.append("title", data.title);
    }

    if (Number(data.categoryOffer) !== Number(original.discount)) {
      formData.append("discount", data.categoryOffer);
    }

    if (Number(data.maxRedeemable) !== Number(original.maxReedemable)) {
      formData.append("maxRedeemable", data.maxRedeemable);
    }

    if (data.discountType !== original.discountType) {
      formData.append("discountType", data.discountType);
    }

    const isListedBool = data.isListed == true;
    if (data.isListed !== original.isListed) {
      formData.append("isListed", isListedBool);
    }
    if (data.isFeatured !== original.isFeatured) {
      formData.append("isFeatured", data.isFeatured);
    }

    // Append image only if a new one was selected
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    let id = original._id;

    if ([...formData.keys()].length === 0) {
      toast("No changes detected.");
      navigate("/admin/categories");
      return;
    }

    updateMutate(
      { id, formData },
      {
        onError: (error) => {
          const apiError = error.response?.data?.error;
          if (apiError?.code === "CATEGORY_ALREADY_EXISTS") {
            setError("title", { type: "manual", message: apiError.message });
          } else {
            toast.error(error.response?.data?.message || "Update failed.");
          }
        },
      }
    );
  };

  if (isLoadingDetails) {
    return <div className="p-6 text-center">Loading category details...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading category: {fetchError.message}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Category</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200"
      >
        {/* --- Image Uploader --- */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Header Image
          </label>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageDropzone
                onChange={field.onChange}
                value={field.value}
                initialImageUrl={existingImageUrl}
                aspect={16 / 9}
              />
            )}
          />
          {/* Note: Schema validation for 'image' might need adjustment */}
          {/* 'image' is only required on ADD, maybe not on EDIT unless changed */}
          {errors.image && (
            <span className="text-red-500 text-sm mt-1">
              {errors.image.message}
            </span>
          )}
        </div>

        {/* --- Offer Details Grid (Same as AddCategory) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FormInput
            label="Category Offer"
            id="categoryOffer"
            type="number"
            {...register("categoryOffer")}
            error={errors.categoryOffer?.message}
          />
          <FormInput
            label="Max Redeemable"
            id="maxRedeemable"
            type="number"
            {...register("maxRedeemable")}
            error={errors.maxRedeemable?.message}
          />
          <div className="flex flex-col">
            <label
              htmlFor="discountType"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Discount Type
            </label>
            <select
              id="discountType"
              className={`border p-2 rounded-md ${
                errors.discountType ? "border-red-500" : "border-gray-300"
              }`}
              {...register("discountType")}
            >
              <option value="flat">Flat</option>
              <option value="percent">Percent</option>
            </select>
            {errors.discountType && (
              <span className="text-red-500 text-sm mt-1">
                {errors.discountType.message}
              </span>
            )}
          </div>
        </div>

        {/* --- Category Name (Same as AddCategory) --- */}
        <div className="mb-6">
          <FormInput
            label="Category Name"
            id="title"
            type="text"
            placeholder="Type category name here.."
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        {/* --- Status & Featured (Same as AddCategory) --- */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
          {/* Listed/Unlisted Radio Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Controller
              name="isListed"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      onChange={() => field.onChange("true")}
                      checked={field.value === "true"}
                      className="form-radio text-green-600"
                    />
                    <span className="text-gray-700">Listed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      onChange={() => field.onChange("false")}
                      checked={field.value === "false"}
                      className="form-radio text-gray-600"
                    />
                    <span className="text-gray-700">Unlisted</span>
                  </label>
                </div>
              )}
            />
          </div>
          {/* Featured Checkbox */}
          <div className="flex items-center h-full pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="form-checkbox rounded text-green-600"
              />
              <span className="text-sm text-gray-700">
                Highlight this Category in a featured section.
              </span>
            </label>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-black text-white py-2 px-8 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {isUpdating ? "Updating..." : "Update Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
