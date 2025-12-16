import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { productSchema } from "./productSchema.js";
import {
  useProductDetails,
  useUpdateProduct,
  useAllCategories,
} from "./productHooks.js";

import ProductImageDropzone from "../../../components/admin/ProductImageDropzone.jsx";
import { S3_URL } from "../../../utils/constants";
import { FormInput } from "../../../components/common/FormComponents.jsx";
import { FormTextarea } from "../../../components/common/FormComponents.jsx";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const EditProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: productDetailsPayload,
    isLoading: isLoadingDetails,
    isError,
    error: fetchError,
  } = useProductDetails(slug);
  const { data: categoriesData } = useAllCategories();

  // --- Mutation ---
  const { mutate: updateMutate, isLoading: isUpdating } = useUpdateProduct();

  const originalData = useMemo(
    () => productDetailsPayload?.data?.product,
    [productDetailsPayload]
  );
  const originalFaqs = useMemo(
    () => productDetailsPayload?.data?.faqs || [],
    [productDetailsPayload]
  );

  const [imagesToDelete, setImagesToDelete] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, dirtyFields }, // isDirty tracks if any field changed from defaultValues
  } = useForm({
    resolver: zodResolver(productSchema), // Use the EDIT schema
    defaultValues: {},
  });

  const { fields: variantFields } = useFieldArray({
    control,
    name: "variants",
  });
  const {
    fields: faqFields,
    replace: replaceFaqs,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({ control, name: "faqs" });

  useEffect(() => {
    // Only reset if originalData exists and categories are loaded (or category part isn't needed for reset)
    if (originalData && categoriesData?.data?.categories) {
      const existingVariantsMap = (originalData.variants || []).reduce(
        (acc, v) => {
          acc[v.size] = { size: v.size, stock: v.stock };
          return acc;
        },
        {}
      );
      const formVariants = AVAILABLE_SIZES.map(
        (size) => existingVariantsMap[size] || { size, stock: 0 }
      );

      const categoryOptions = categoriesData.data.categories || [];
      const selectedCategories =
        originalData.categoryIds
          ?.map((id) => {
            const cat = categoryOptions.find((c) => c._id === id);
            return cat ? { value: cat._id, label: cat.title } : null;
          })
          .filter(Boolean) || [];

      const selectedTags =
        originalData.tags?.map((tag) => ({ value: tag, label: tag })) || [];

      const detailsMap = (originalData.details || []).reduce((acc, detail) => {
        acc[detail.attribute] = detail.description;
        return acc;
      }, {});

      const initialCoverIndex = 0;

      reset(
        {
          title: originalData.title,
          description: originalData.description || "",
          shortDescription: originalData.shortDescription || "",
          priceList: originalData.price?.list / 100,
          priceSale: originalData.price?.sale / 100 || "",
          variants: formVariants,
          categoryIds: selectedCategories,
          tags: selectedTags,
          isListed: originalData.isListed ? "true" : "false",
          detailsMaterial: detailsMap["Material"] || "",
          detailsFitType: detailsMap["Fit Type"] || "",
          detailsNeckType: detailsMap["Neck Type"] || "",
          detailsSleeveType: detailsMap["Sleeve Type"] || "",
          detailsInstructions: detailsMap["Instructions"] || "",
          images: [], // Reset 'new images' field
          coverImageIndex: initialCoverIndex,
        },
        {
          keepDirty: false, // Reset dirty state after populating
          keepDefaultValues: false, // Ensure defaults are overwritten
        }
      );

      replaceFaqs(originalFaqs); // Populate FAQs field array

      // --- FIX: Reset images marked for deletion when data loads ---
      setImagesToDelete([]);
    }
  }, [originalData, originalFaqs, categoriesData, reset, replaceFaqs]);

  const handleRemoveInitialImage = (urlToRemove) => {
    const imageIdToRemove = urlToRemove.replace(`${S3_URL}/`, "");
    setImagesToDelete((prev) => [...prev, imageIdToRemove]);
  };
  const filteredInitialUrls =
    productDetailsPayload?.data?.product?.imageUrls.filter(
      // (url) => !imagesToDelete.includes(url.replace(`${S3_URL}/`, ""))
      (url) => url
    ) || [];

  const onSubmit = (data) => {
    if (!originalData) return;

    const newImages = data.images || [];
    const hasMeaningfulChanges =
      Object.keys(dirtyFields).length > 0 ||
      newImages.length > 0 ||
      imagesToDelete.length > 0;

    if (!hasMeaningfulChanges) {
      toast("No changes detected.");
      navigate("/admin/products");
      return;
    }

    const formData = new FormData();
    const productChanges = {};

    Object.keys(dirtyFields).forEach((key) => {
      switch (key) {
        case "title":
          productChanges.title = data.title;
          break;
        case "description":
          productChanges.description = data.description;
          break;
        case "shortDescription":
          productChanges.shortDescription = data.shortDescription;
          break;
        case "isListed":
          productChanges.isListed = data.isListed;
          break;
        case "priceList":
        case "priceSale":
          if (!productChanges.price) productChanges.price = {};
          // Always send both if either changed, ensures validation passes on backend
          productChanges.price.list = data.priceList;
          productChanges.price.sale = data.priceSale || null; // Send null if empty
          break;
        // Handle arrays (use current data as RHF dirtyFields for arrays is basic)
        case "variants":
          // Sending only variants with stock >= 0 might be desired
          productChanges.variants = data.variants.filter((v) => v.stock >= 0);
          break;
        case "categoryIds":
          productChanges.categoryIds = data.categoryIds; // Already transformed {value, label} -> value[] by schema
          break;
        case "tags":
          productChanges.tags = data.tags; // Already transformed {value, label} -> value[] by schema
          break;
        // Reconstruct details if any detail field is dirty
        case "detailsMaterial":
        case "detailsFitType":
        case "detailsNeckType":
        case "detailsSleeveType":
        case "detailsInstructions":
          if (!productChanges.details) {
            // Reconstruct only once
            productChanges.details = [
              { attribute: "Material", description: data.detailsMaterial },
              { attribute: "Fit Type", description: data.detailsFitType },
              { attribute: "Neck Type", description: data.detailsNeckType },
              { attribute: "Sleeve Type", description: data.detailsSleeveType },
              {
                attribute: "Instructions",
                description: data.detailsInstructions,
              },
            ].filter((d) => d.description?.trim()); // Filter empty
          }
          break;
        case "coverImageIndex":
          productChanges.coverImageIndex = data.coverImageIndex;
          break;
        // Ignore 'images' and 'faqs' - handled separately below
      }
    });

    // --- Append Changes to FormData ---
    let formDataHasData = false; // Flag to check if anything is appended

    if (Object.keys(productChanges).length > 0) {
      formData.append("productData", JSON.stringify(productChanges));
      formDataHasData = true;
    }

    // Append FAQs only if the FAQ array itself is marked dirty by RHF
    if (dirtyFields.faqs) {
      formData.append("faqsData", JSON.stringify(data.faqs || []));
      formDataHasData = true;
    }

    // Append NEW image files
    if (newImages.length > 0) {
      newImages.forEach((file) => formData.append(`images`, file));
      formDataHasData = true;
      // If new images are added, ensure cover index is sent (even if 0)
      if (
        !Object.prototype.hasOwnProperty.call(productChanges, "coverImageIndex")
      ) {
        formData.append("coverImageIndex", data.coverImageIndex.toString());
      }
    }

    // Append list of images to delete (if any)
    if (imagesToDelete.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      formDataHasData = true;
    }

    // --- Final check if FormData is actually empty ---
    if (!formDataHasData) {
      toast("No effective changes detected to save.");
      navigate("/admin/products");
      return;
    }

    // --- Call Mutation ---
    let id = productDetailsPayload.data.product._id;
    updateMutate(
      { id, formData },
      {
        onError: (err) => {
          const errorMessage = err?.response?.data?.error.message;
          ("Something went wrong while updating the product.");
          toast.error(errorMessage);
        },
      }
    );
  };

  // --- Render Logic ---
  if (isLoadingDetails)
    return <div className="p-6 text-center">Loading product details...</div>;
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">
        Error: {fetchError?.response?.data?.message || fetchError.message}
      </div>
    );
  if (!originalData)
    return (
      <div className="p-6 text-center text-gray-500">
        Product data not found or still loading.
      </div>
    );

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Product</h1>
      {/* Add key to potentially help reset state if navigating between different edit pages */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
        key={originalData._id}
      >
        {/* --- Basic Details & Images --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Title, Desc, Pricing) */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold border-b pb-2">
              Basic Details
            </h2>
            <FormInput
              label="Product Title"
              id="title"
              {...register("title")}
              error={errors.title?.message}
            />
            <FormTextarea
              label="Product Description"
              id="description"
              {...register("description")}
              error={errors.description?.message}
              rows={4}
            />
            <h2 className="text-lg font-semibold border-b pb-2 pt-4">
              Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Product list price (₹)"
                id="priceList"
                type="number"
                step="0.01"
                {...register("priceList")}
                error={errors.priceList?.message}
              />
              <FormInput
                label="Product sale price (₹)"
                id="priceSale"
                type="number"
                step="0.01"
                {...register("priceSale")}
                error={errors.priceSale?.message}
              />
            </div>
          </div>

          {/* Right Column (Image Dropzone, Short Desc) */}
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <Controller
              name="images" // RHF field for NEW File[]
              control={control}
              render={({ field: imageField }) => (
                <Controller
                  name="coverImageIndex" // RHF field for index
                  control={control}
                  render={({ field: coverIndexField }) => (
                    // --- FIX: Pass correct component name ---
                    <ProductImageDropzone
                      label="Product Images"
                      onChangeFiles={imageField.onChange}
                      valueFiles={imageField.value || []} // New files
                      onChangeCoverIndex={coverIndexField.onChange}
                      valueCoverIndex={coverIndexField.value} // Current index
                      // --- Pass existing URLs & remove handler ---
                      initialImageUrls={filteredInitialUrls}
                      onRemoveInitialImage={handleRemoveInitialImage} // Pass remove handler
                      error={
                        errors.images?.message || errors.images?.root?.message
                      }
                      aspect={1 / 1} // Square aspect ratio
                    />
                  )}
                />
              )}
            />
            {errors.coverImageIndex && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.coverImageIndex.message}
              </span>
            )}
            <FormTextarea
              label="Short Description"
              id="shortDescription"
              {...register("shortDescription")}
              error={errors.shortDescription?.message}
              rows={3}
            />
          </div>
        </div>

        {/* --- Inventory --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold border-b pb-2 mb-6">
            Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {variantFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <label
                  htmlFor={`variants.${index}.stock`}
                  className="w-10 text-center font-bold text-gray-800 uppercase flex-shrink-0"
                >
                  {field.size}
                </label>
                <div className="relative">
                  <input
                    id={`variants.${index}.stock`}
                    type="number"
                    min="0"
                    placeholder="Stock"
                    className={`border p-2 rounded-md w-24 text-center ${
                      errors.variants?.[index]?.stock
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    }`}
                    {...register(`variants.${index}.stock`)}
                  />
                  {errors.variants?.[index]?.stock && (
                    <p className="text-red-500 text-xs mt-1 text-left">
                      {errors.variants[index].stock.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.variants && typeof errors.variants.message === "string" && (
            <p className="text-red-500 text-sm mt-2">
              {errors.variants.message}
            </p>
          )}
        </div>

        {/* --- Categories & Tags --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Categories</h2>
          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={
                  categoriesData?.data?.categories.map((c) => ({
                    value: c._id,
                    label: c.title,
                  })) || []
                }
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select categories..."
              />
            )}
          />
          {errors.categoryIds && (
            <span className="text-red-500 text-sm">
              {errors.categoryIds.message}
            </span>
          )}

          <h2 className="text-lg font-semibold border-b pb-2 pt-4">
            Product Tags
          </h2>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <CreatableSelect
                {...field}
                isMulti
                placeholder="Type and press enter to add tags..."
              />
            )}
          />
          {errors.tags && (
            <span className="text-red-500 text-sm">{errors.tags.message}</span>
          )}
        </div>

        {/* --- Product Details --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">
            Product Details
          </h2>
          <FormInput
            label="Material"
            id="detailsMaterial"
            {...register("detailsMaterial")}
            error={errors.detailsMaterial?.message}
          />
          <FormInput
            label="Fit type"
            id="detailsFitType"
            {...register("detailsFitType")}
            error={errors.detailsFitType?.message}
          />
          <FormInput
            label="Neck type"
            id="detailsNeckType"
            {...register("detailsNeckType")}
            error={errors.detailsNeckType?.message}
          />
          <FormInput
            label="Sleeve type"
            id="detailsSleeveType"
            {...register("detailsSleeveType")}
            error={errors.detailsSleeveType?.message}
          />
          <FormTextarea
            label="Instructions"
            id="detailsInstructions"
            {...register("detailsInstructions")}
            error={errors.detailsInstructions?.message}
            rows={3}
          />
        </div>

        {/* --- FAQs --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">FAQs</h2>
            <button
              type="button"
              onClick={() => appendFaq({ question: "", answer: "" })}
              className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Add FAQ
            </button>
          </div>
          {faqFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b pb-4 last:border-b-0"
            >
              <div className="md:col-span-5">
                <FormInput
                  label={`Question ${index + 1}`}
                  id={`faqs.${index}.question`}
                  {...register(`faqs.${index}.question`)}
                  error={errors.faqs?.[index]?.question?.message}
                />
              </div>
              <div className="md:col-span-6">
                <FormTextarea
                  label={`Answer ${index + 1}`}
                  id={`faqs.${index}.answer`}
                  {...register(`faqs.${index}.answer`)}
                  error={errors.faqs?.[index]?.answer?.message}
                  rows={2}
                />
              </div>
              <div className="md:col-span-1 flex items-end justify-center pb-2">
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- Final Actions: Status & Submit --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Status Radio Controller */}
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
                    {" "}
                    <input
                      type="radio"
                      onChange={() => field.onChange("true")}
                      checked={field.value === "true"}
                      className="form-radio text-green-600 focus:ring-green-500"
                    />{" "}
                    <span className="text-gray-700">Listed</span>{" "}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    {" "}
                    <input
                      type="radio"
                      onChange={() => field.onChange("false")}
                      checked={field.value === "false"}
                      className="form-radio text-gray-600 focus:ring-gray-500"
                    />{" "}
                    <span className="text-gray-700">Unlisted</span>{" "}
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
          {/* Submit/Cancel Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
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
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
