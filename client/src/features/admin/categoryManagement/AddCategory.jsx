import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "./categorySchema"; // Adjust path if needed
import { useAddCategory } from "./categoryHooks"; // Adjust path if needed
import ImageDropzone from "../../../components/admin/ImageDropzone";
import { FormInput } from "../../../components/common/FormComponents";

// --- Main AddCategory Component ---
const AddCategory = () => {
  const { mutate, isLoading: isSubmitting } = useAddCategory();
  const [serverError, setServerError] = React.useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    watch,
    setValue,
    unregister,
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      offerEnabled: false,
      isListed: "true",
      inHome: false,
      inCollections: false,
      discountType: "", // Start with placeholder selected
      discountAmount: undefined,
      minPurchaseAmount: undefined,
      discountPercentage: undefined,
      maxRedeemable: undefined,
      image: null, // Initialize image field
    },
  });

  const offerEnabled = watch("offerEnabled");
  const discountType = watch("discountType");

  // Effect to manage field registration based on offer status and type
  useEffect(() => {
    if (!offerEnabled) {
      // If offer is disabled, unregister all related fields and reset type
      unregister([
        "discountType",
        "discountAmount",
        "minPurchaseAmount",
        "discountPercentage",
        "maxRedeemable",
      ]);
      setValue("discountType", undefined); // Reset type to placeholder
      setValue("discountAmount", undefined);
      setValue("minPurchaseAmount", undefined);
      setValue("discountPercentage", undefined);
      setValue("maxRedeemable", undefined);
    } else {
      // If offer is enabled, register the type selector
      register("discountType");

      // Register fields for the currently selected type and unregister/clear others
      if (discountType === "flat") {
        register("discountAmount");
        register("minPurchaseAmount");
        unregister(["discountPercentage", "maxRedeemable"]);
        setValue("discountPercentage", undefined);
        setValue("maxRedeemable", undefined);
      } else if (discountType === "percent") {
        register("discountPercentage");
        register("maxRedeemable");
        unregister(["discountAmount", "minPurchaseAmount"]);
        setValue("discountAmount", undefined);
        setValue("minPurchaseAmount", undefined);
      } else {
        // If type is empty (""), unregister all specific fields initially
        unregister([
          "discountAmount",
          "minPurchaseAmount",
          "discountPercentage",
          "maxRedeemable",
        ]);
      }
    }
  }, [offerEnabled, discountType, register, unregister, setValue]);
  console.log(errors);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);

    // Conditionally append offer data based on type
    if (data.offerEnabled && data.discountType) {
      formData.append("discountType", data.discountType);
      if (data.discountType === "flat") {
        formData.append("discount", data.discountAmount ?? 0);
        formData.append("minPurchaseAmount", data.minPurchaseAmount ?? 0);
      } else if (data.discountType === "percent") {
        formData.append("discount", data.discountPercentage ?? 0);
        formData.append("maxRedeemable", data.maxRedeemable ?? 0);
      }
    } else {
      formData.append("discountType", "");
      formData.append("discount", 0);
      formData.append("minPurchaseAmount", 0);
      formData.append("maxRedeemable", 0);
    }
    formData.append("isListed", data.isListed); // Already boolean from schema transform
    formData.append("inHome", data.inHome);
    formData.append("inCollections", data.inCollections);
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }
    console.log("test");
    mutate(formData, {
      onError: (error) => {
        const apiError = error.response?.data?.error;
        // Example: Handle specific backend error for duplicate category title
        if (apiError) {
          setError("title", {
            type: "manual",
            message:
              apiError.message || "A category with this title already exists.",
          });
        } else {
          setServerError(
            apiError?.message || "Something went wrong. Please try again."
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

        {/* --- Enable Offer Checkbox --- */}
        <div className="mb-6 border-t pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("offerEnabled")}
              className="form-checkbox rounded text-green-600 h-5 w-5 focus:ring-green-500" // Added focus style
            />
            <span className="text-md font-medium text-gray-700">
              Enable Offer for this Category
            </span>
          </label>
        </div>

        {/* --- Conditional Offer Section --- */}
        {offerEnabled && (
          <div className="mb-6 pt-6 border-t animate-fadeIn">
            <div className="mb-6 max-w-xs">
              <label
                htmlFor="discountType"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Discount Type
              </label>
              <select
                id="discountType"
                className={`border p-2 rounded-md w-full ${
                  errors.discountType
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                } focus:outline-none focus:ring-1`} // Added focus styles
                {...register("discountType")}
              >
                <option value="" disabled>
                  Select discount type...
                </option>
                <option value="flat">Flat Amount (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
              {errors.discountType && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.discountType.message}
                </span>
              )}
            </div>
            {/* Conditional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Flat Discount Fields --- */}
              {discountType === "flat" && (
                <>
                  <FormInput
                    label="Discount Amount (₹)"
                    id="discountAmount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 100"
                    {...register("discountAmount")}
                    error={errors.discountAmount?.message}
                  />
                  <FormInput
                    label="Minimum Purchase Amount (₹)"
                    id="minPurchaseAmount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 500"
                    {...register("minPurchaseAmount")}
                    error={errors.minPurchaseAmount?.message}
                  />
                </>
              )}

              {/* --- Percent Discount Fields --- */}
              {discountType === "percent" && (
                <>
                  <FormInput
                    label="Discount Percentage (%)"
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g., 10"
                    {...register("discountPercentage")}
                    error={errors.discountPercentage?.message}
                  />
                  <FormInput
                    label="Max Redeemable Amount (₹)"
                    id="maxRedeemable"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50 (Max discount user gets)"
                    {...register("maxRedeemable")}
                    error={errors.maxRedeemable?.message}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* --- Category Name --- */}
        <div className={`mb-6 ${offerEnabled ? "border-t pt-6" : ""}`}>
          <FormInput
            label="Category Name"
            id="title"
            type="text"
            placeholder="e.g., Club Jerseys, National Teams"
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        {/* --- Status & Display Toggles --- */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-t pt-6">
          {/* Status */}
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
                      className="form-radio text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Listed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      onChange={() => field.onChange("false")}
                      checked={field.value === "false"}
                      className="form-radio text-gray-600 focus:ring-gray-500"
                    />
                    <span className="text-gray-700">Unlisted</span>
                  </label>
                </div>
              )}
            />
            {errors.isListed && (
              <span className="text-red-500 text-sm mt-1">
                {errors.isListed.message}
              </span>
            )}
          </div>

          {/* Display Toggles */}
          <div className="flex flex-col gap-4 pt-4 md:pt-0 md:items-start md:ml-auto">
            {" "}
            {/* Adjusted alignment */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("inHome")}
                className="form-checkbox rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Show in Homepage 'Discover' section
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("inCollections")}
                className="form-checkbox rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Show in 'Browse by Collections' section
              </span>
            </label>
          </div>
        </div>

        {/* --- Submit Button --- */}
        {serverError && (
          <div className="text-red-600 text-sm mb-4">{serverError}</div>
        )}
        <div className="flex justify-end border-t pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white py-2 px-8 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed" // Added disabled opacity
          >
            {isSubmitting ? "Adding..." : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
