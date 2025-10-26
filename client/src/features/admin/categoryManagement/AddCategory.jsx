import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "./categorySchema";
import ImageDropzone from "../../../components/admin/ImageDropZone.jsx";
import { useAddCategory } from "./categoryHooks";

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

const AddCategory = () => {
  const { mutate, isLoading: isSubmitting } = useAddCategory();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("discount", data.categoryOffer);
    formData.append("maxRedeemable", data.maxRedeemable);
    formData.append("discountType", data.discountType);
    formData.append("isListed", data.isListed);
    formData.append("inHome", data.inHome);
    formData.append("inCollections", data.inCollections);
    formData.append("image", data.image);

    console.log(data);
    mutate(formData, {
      onError: (error) => {
        const apiError = error.response?.data?.error;

        if (apiError) {
          // 5. Set the error message directly on the 'title' field
          setError("title", {
            type: "manual",
            message: apiError.message,
          });
        } else {
          // 6. Show a generic toast for all other errors
          toast.error(
            error.response?.data?.message || "An unexpected error occurred"
          );
        }
      },
    });
  };

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Add New Category
      </h1>
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
                aspect={16 / 9}
              />
            )}
          />
          {errors.image && (
            <span className="text-red-500 text-sm mt-1">
              {errors.image.message}
            </span>
          )}
        </div>

        {/* --- Offer Details Grid --- */}
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

        {/* --- Category Name --- */}
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

        {/* --- Status & Featured --- */}
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
                      checked={
                        field.value === "true" || field.value === undefined
                      }
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
                {...register("inHome")}
                className="form-checkbox rounded text-green-600"
              />
              <span className="text-sm text-gray-700">
                Highlight this Category in landing page
              </span>
            </label>
          </div>
          <div className="flex items-center h-full pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("inCollections")}
                className="form-checkbox rounded text-green-600"
              />
              <span className="text-sm text-gray-700">
                Highlight this Category in collections
              </span>
            </label>
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white py-2 px-8 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {isSubmitting ? "Adding..." : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
