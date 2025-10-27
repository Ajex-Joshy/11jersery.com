import React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react"; // Add icons

import { productSchema } from "./productSchema";
import { useAddProduct, useAllCategories } from "./productHooks";
import ImageDropzone from "../../../components/admin/ImageDropZone";

// --- Reusable FormInput ---
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
// A simple reusable textarea component for the form
const FormTextarea = ({ label, id, error, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      className={`border p-2 rounded-md ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...props} // Spreads other props like rows, placeholder, register, etc.
    />
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);

// --- Sizes for Variants ---
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const AddProduct = () => {
  const { mutate: addProductMutate, isLoading: isSubmitting } = useAddProduct();
  const { data: categoriesData } = useAllCategories(); // Fetch categories

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isListed: "true",
      priceList: "",
      priceSale: "",
      variants: AVAILABLE_SIZES.map((size) => ({ size, stock: 0 })),
      categoryIds: [],
      tags: [],
      faqs: [],
      detailsMaterial: "",
      detailsFitType: "",
      detailsNeckType: "",
      detailsSleeveType: "",
      detailsInstructions: "",
      images: [],
    },
  });
  console.log(errors);

  // --- Field Array Hooks ---
  const { fields: variantFields } = useFieldArray({
    control,
    name: "variants",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "faqs",
  });

  // --- Category Options for Select ---
  const categoryOptions =
    categoriesData?.data?.categories.map((cat) => ({
      value: cat._id,
      label: cat.title,
    })) || [];

  // --- Submit Handler ---
  const onSubmit = (data) => {
    const formData = new FormData();

    const detailsArray = [
      { attribute: "Material", description: data.detailsMaterial },
      { attribute: "Fit Type", description: data.detailsFitType },
      { attribute: "Neck Type", description: data.detailsNeckType },
      { attribute: "Sleeve Type", description: data.detailsSleeveType },
      { attribute: "Instructions", description: data.detailsInstructions },
    ].filter(
      (detail) => detail.description && detail.description.trim() !== ""
    ); // Filter out empty descriptions

    // 1. Prepare the nested 'product' object (excluding files)
    const productData = {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      price: {
        list: data.priceList,
        sale: data.priceSale,
      },
      variants: data.variants.filter((v) => v.stock > 0),
      categoryIds: data.categoryIds,
      tags: data.tags,
      isListed: data.isListed,
      details: detailsArray,
    };
    // 2. Prepare the 'faqs' array
    const faqsData = data.faqs;

    // 3. Stringify the JSON parts
    formData.append("productData", JSON.stringify(productData));
    formData.append("faqsData", JSON.stringify(faqsData));

    // 4. Append the main image file
    if (data.image instanceof File) {
      formData.append("images", data.image); // Use 'images' if backend expects multiple
    }
    // TODO: Append secondary images when implemented

    // 5. Call the mutation
    addProductMutate(formData, {
      onError: (error) => {
        // Handle specific errors (e.g., duplicate slug/title)
        const apiError = error.response?.data?.error;
        if (apiError?.code === "PRODUCT_SLUG_EXISTS") {
          setError("title", { type: "manual", message: apiError.message });
        } else {
          toast.error(
            error.response?.data?.message || "An unexpected error occurred"
          );
        }
      },
    });
  };

  // --- JSX ---
  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- Basic Details & Images --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Title, Desc, Pricing */}
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
                label="Product list price"
                id="priceList"
                type="number"
                step="0.01"
                {...register("priceList")}
                error={errors.priceList?.message}
              />
              <FormInput
                label="Product sale price"
                id="priceSale"
                type="number"
                step="0.01"
                {...register("priceSale")}
                error={errors.priceSale?.message}
              />
            </div>
          </div>

          {/* Right Column: Image Upload, Short Desc */}
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold border-b pb-2">
              Upload Product Image
            </h2>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageDropzone
                  onChange={field.onChange}
                  value={field.value}
                  aspect={1 / 1}
                /> // Square aspect for product?
              )}
            />
            {errors.image && (
              <span className="text-red-500 text-sm">
                {errors.image.message}
              </span>
            )}
            {/* TODO: Add inputs/buttons for secondary images */}
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 border border-dashed border-gray-300 rounded h-20 flex items-center justify-center text-gray-400 hover:border-gray-500"
              >
                {" "}
                <ImageIcon size={24} />{" "}
              </button>
              <button
                type="button"
                className="flex-1 border border-dashed border-gray-300 rounded h-20 flex items-center justify-center text-gray-400 hover:border-gray-500"
              >
                {" "}
                <ImageIcon size={24} />{" "}
              </button>
              <button
                type="button"
                className="flex-1 border border-dashed border-gray-300 rounded h-20 flex items-center justify-center text-gray-400 hover:border-gray-500"
              >
                {" "}
                <ImageIcon size={24} />{" "}
              </button>
            </div>

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
          {/* --- FIX: Use Grid Layout --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {" "}
            {/* Changed to grid, adjust gap as needed */}
            {variantFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                {/* Size Label */}
                <label
                  htmlFor={`variants.${index}.stock`}
                  className="w-10 text-center font-bold text-gray-800 uppercase flex-shrink-0"
                >
                  {field.size}
                </label>

                {/* Stock Input Container */}
                <div className="relative">
                  <input
                    id={`variants.${index}.stock`}
                    type="number"
                    min="0"
                    placeholder="Stock"
                    className={`border p-2 rounded-md w-24 text-center ${
                      // Keep fixed width for input
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
          {/* General error message */}
          {errors.variants &&
            !errors.variants.length &&
            typeof errors.variants.message === "string" && (
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
                options={categoryOptions}
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

        {/* --- Product Details (Optional) --- */}
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
            <h2 className="text-lg font-semibold">FAQs (Optional)</h2>
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
              className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b pb-4"
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
                  {/* ... (Radio buttons for Listed/Unlisted, same as AddCategory) ... */}
                </div>
              )}
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white py-2 px-8 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {isSubmitting ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
