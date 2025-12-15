import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Use the same updated schema as AddCategory
import { categorySchema } from "./categorySchema";
import { useCategoryDetails, useUpdateCategory } from "./categoryHooks";
// Removed unused import: import { sl } from "zod/v4/locales";
import { S3_URL } from "../../../utils/constants"; // Ensure path is correct
import ImageDropzone from "../../../components/admin/ImageDropzone";
import { FormInput } from "../../../components/common/FormComponents";

const EditCategory = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Fetch existing category data
  const {
    data: categoryDetailsData,
    isLoading: isLoadingDetails,
    isError,
  } = useCategoryDetails(slug);

  // Update mutation hook
  const { mutate: updateMutate, isLoading: isUpdating } = useUpdateCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    watch,
    setValue,
    unregister,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      // Initialize defaults (will be overwritten by reset)
      title: "",
      offerEnabled: false,
      discountType: "",
      discountAmount: undefined,
      minPurchaseAmount: undefined,
      discountPercentage: undefined,
      maxRedeemable: undefined,
      isListed: "true",
      inHome: false,
      inCollections: false,
      image: null,
    },
  });

  const offerEnabled = watch("offerEnabled");
  const discountType = watch("discountType");

  // --- Populate form when data loads ---
  useEffect(() => {
    if (categoryDetailsData?.data) {
      const category = categoryDetailsData.data;
      const hasOffer =
        category.discount > 0 && category.discountType ? true : false;

      reset({
        title: category.title,
        // --- Set checkbox based on existing offer ---
        offerEnabled: hasOffer,
        // --- Set type or placeholder ---
        discountType: hasOffer ? category.discountType : "",
        // --- Set specific values based on type ---
        discountAmount: category.discount,
        minPurchaseAmount:
          category.discountType === "flat"
            ? category.minPurchaseAmount
            : undefined,
        discountPercentage:
          category.discountType === "percent" ? category.discount : undefined,
        maxRedeemable:
          category.discountType === "percent"
            ? category.maxRedeemable
            : undefined,
        // --- Other fields ---
        isListed: category.isListed ? "true" : "false",
        inHome: category.inHome,
        inCollections: category.inCollections,
        image: null,
      });
      setValue("offerEnabled", hasOffer);
      setValue("discountType", category.discountType || "");
    }
  }, [categoryDetailsData, reset, setValue]);
  // --- Effect to manage field registration (same as AddCategory) ---
  useEffect(() => {
    if (!offerEnabled) {
      unregister([
        "discountType",
        "discountAmount",
        "minPurchaseAmount",
        "discountPercentage",
        "maxRedeemable",
      ]);
      setValue("discountType", "");
      setValue("discountAmount", undefined);
      setValue("minPurchaseAmount", undefined);
      setValue("discountPercentage", undefined);
      setValue("maxRedeemable", undefined);
    } else {
      register("discountType");
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
        unregister([
          "discountAmount",
          "minPurchaseAmount",
          "discountPercentage",
          "maxRedeemable",
        ]);
      }
    }
  }, [offerEnabled, discountType, register, unregister, setValue]);

  // Construct existing image URL safely

  // --- Handle Form Submission ---
  const onSubmit = (data) => {
    const originalData = categoryDetailsData?.data;
    if (!originalData) {
      toast.error("Original category data not loaded. Cannot update.");
      return;
    }

    const formData = new FormData();
    let hasChanges = false;

    // --- Append only changed fields ---\

    // Title
    if (data.title !== originalData.title) {
      formData.append("title", data.title);
      hasChanges = true;
    }

    // Offer Logic - Check enabled status and type
    const originallyHadOffer =
      originalData.discount > 0 && originalData.discountType;
    if (
      data.offerEnabled !== originallyHadOffer ||
      data.discountType !== originalData.discountType
    ) {
      hasChanges = true; // Offer status or type changed
    }

    if (data.offerEnabled && data.discountType) {
      formData.append("discountType", data.discountType);
      if (data.discountType === "flat") {
        if (
          Number(data.discountAmount ?? 0) !==
          Number(originalData.discount ?? 0)
        ) {
          formData.append("discount", data.discountAmount ?? 0);
          hasChanges = true;
        }
        if (
          Number(data.minPurchaseAmount ?? 0) !==
          Number(originalData.minPurchaseAmount ?? 0)
        ) {
          formData.append("minPurchaseAmount", data.minPurchaseAmount ?? 0);
          hasChanges = true;
        }
        // Send default/null for unused fields if changed from percent
        if (originallyHadOffer && originalData.discountType === "percent") {
          formData.append("maxRedeemable", 0);
          hasChanges = true;
        }
      } else if (data.discountType === "percent") {
        if (
          Number(data.discountPercentage ?? 0) !==
          Number(originalData.discount ?? 0)
        ) {
          formData.append("discount", data.discountPercentage ?? 0);
          hasChanges = true;
        }
        if (
          Number(data.maxRedeemable ?? 0) !==
          Number(originalData.maxRedeemable ?? 0)
        ) {
          formData.append("maxRedeemable", data.maxRedeemable ?? 0);
          hasChanges = true;
        }
        // Send default/null for unused fields if changed from flat
        if (originallyHadOffer && originalData.discountType === "flat") {
          formData.append("minPurchaseAmount", 0);
          hasChanges = true;
        }
      }
    } else if (originallyHadOffer) {
      // Offer was disabled, send defaults to clear them on backend
      formData.append("discountType", ""); // Or null
      formData.append("discount", 0);
      formData.append("minPurchaseAmount", 0);
      formData.append("maxRedeemable", 0);
      hasChanges = true;
    }

    // Status & Display Toggles
    const isListedBool = data.isListed === true;
    if (isListedBool !== originalData.isListed) {
      formData.append("isListed", isListedBool);
      hasChanges = true;
    }
    if (data.inHome !== originalData.inHome) {
      formData.append("inHome", data.inHome);
      hasChanges = true;
    }
    if (data.inCollections !== originalData.inCollections) {
      formData.append("inCollections", data.inCollections);
      hasChanges = true;
    }

    // Image - Append only if a new File was selected
    if (data.image instanceof File) {
      formData.append("image", data.image);
      hasChanges = true;
    }

    // --- Check if any changes were made ---
    if (!hasChanges) {
      toast("No changes detected.");
      navigate("/admin/categories"); // Navigate back if no changes
      return;
    }

    // --- Call Mutation ---
    const id = originalData._id;
    updateMutate(
      { id, formData }, // Pass slug and formData
      {
        onError: (error) => {
          const apiError = error.response?.data?.error;
          if (apiError?.code === "CATEGORY_ALREADY_EXISTS") {
            // Or similar update error code
            setError("title", { type: "manual", message: apiError.message });
          } else {
            toast.error(error.response?.data?.message || "Update failed.");
          }
        },
      }
    );
  };

  // --- Render Logic ---
  if (isLoadingDetails) {
    /* ... loading ... */
  }
  if (isError) {
    /* ... error ... */
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
                value={field.value} // New File object
                initialImageUrl={categoryDetailsData?.data?.imageUrl} // Existing URL for preview
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
              className="form-checkbox rounded text-green-600 h-5 w-5 focus:ring-green-500"
            />
            <span className="text-md font-medium text-gray-700">
              Enable Offer for this Category
            </span>
          </label>
        </div>

        {/* --- Conditional Offer Section (Same JSX as AddCategory) --- */}
        {offerEnabled && (
          <div className="mb-6 pt-6 border-t animate-fadeIn">
            {/* Discount Type Select */}
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
                } focus:outline-none focus:ring-1`}
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
              {discountType === "flat" && (
                <>
                  <FormInput
                    label="Discount Amount (₹)"
                    id="discountAmount"
                    type="number"
                    step="0.01"
                    {...register("discountAmount")}
                    error={errors.discountAmount?.message}
                  />
                  <FormInput
                    label="Minimum Purchase Amount (₹)"
                    id="minPurchaseAmount"
                    type="number"
                    step="0.01"
                    {...register("minPurchaseAmount")}
                    error={errors.minPurchaseAmount?.message}
                  />
                </>
              )}
              {discountType === "percent" && (
                <>
                  <FormInput
                    label="Discount Percentage (%)"
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register("discountPercentage")}
                    error={errors.discountPercentage?.message}
                  />
                  <FormInput
                    label="Max Redeemable Amount (₹)"
                    id="maxRedeemable"
                    type="number"
                    step="0.01"
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
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        {/* --- Status & Display Toggles --- */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-t pt-6">
          {/* Status Radio */}
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

        {/* --- Submit/Cancel Buttons --- */}
        <div className="flex justify-end gap-3 border-t pt-6">
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
            className="bg-black text-white py-2 px-8 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
