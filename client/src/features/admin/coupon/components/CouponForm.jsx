import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema } from "../couponSchema.js";
import { Loader2 } from "lucide-react";
import { FormInput } from "../../../../components/common/FormComponents";

const formatDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const CouponForm = ({ initialData, onSubmit, isLoading, onCancel }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          discountValue: initialData.discountValue / 100,
          minPurchaseAmount: initialData.minPurchaseAmount / 100,
          maxDiscountAmount: initialData.maxDiscountAmount / 100,
          startDate: formatDateTimeLocal(initialData.startDate),
          expiryDate: formatDateTimeLocal(initialData.expiryDate),
        }
      : {
          code: "",
          description: "",
          discountType: "FIXED",
          discountValue: "",
          minPurchaseAmount: 0,
          maxDiscountAmount: "",
          usageLimit: "",
          perUserLimit: 1,
          startDate: formatDateTimeLocal(new Date()), // Today with time
          expiryDate: "",
          isActive: true,
        },
  });

  const discountType = watch("discountType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Coupon Code"
          id="code"
          {...register("code")}
          error={errors.code?.message}
          placeholder="SUMMER20"
        />
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">
            Discount Type
          </label>
          <select
            {...register("discountType")}
            className="border p-3 rounded-md text-sm border-gray-300 focus:ring-black"
          >
            <option value="FIXED">Fixed Amount (₹)</option>
            <option value="PERCENTAGE">Percentage (%)</option>
          </select>
        </div>
      </div>

      <FormInput
        label="Description"
        id="description"
        {...register("description")}
        error={errors.description?.message}
        placeholder="e.g. Flat 100 off on all orders"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label={
            discountType === "PERCENTAGE"
              ? "Discount Percentage (%)"
              : "Discount Amount (₹)"
          }
          id="discountValue"
          type="number"
          step="0.01"
          {...register("discountValue")}
          error={errors.discountValue?.message}
        />
        <FormInput
          label="Min Purchase Amount (₹)"
          id="minPurchaseAmount"
          type="number"
          {...register("minPurchaseAmount")}
          error={errors.minPurchaseAmount?.message}
        />
      </div>

      {discountType === "PERCENTAGE" && (
        <FormInput
          label="Max Discount Amount (₹)"
          id="maxDiscountAmount"
          type="number"
          {...register("maxDiscountAmount")}
          error={errors.maxDiscountAmount?.message}
          placeholder="Optional limit"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Usage Limit (Total)"
          id="usageLimit"
          type="number"
          {...register("usageLimit")}
          error={errors.usageLimit?.message}
          placeholder="Unlimited if empty"
        />
        <FormInput
          label="Limit Per User"
          id="perUserLimit"
          type="number"
          {...register("perUserLimit")}
          error={errors.perUserLimit?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Start Date & Time"
          id="startDate"
          type="datetime-local"
          {...register("startDate")}
          error={errors.startDate?.message}
        />
        <FormInput
          label="Expiry Date & Time"
          id="expiryDate"
          type="datetime-local"
          {...register("expiryDate")}
          error={errors.expiryDate?.message}
        />
        <div className="flex items-center gap-3 mt-2">
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-gray-700"
          >
            Active Status
          </label>
          <button
            type="button"
            onClick={() => setValue("isActive", !watch("isActive"))}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
              ${watch("isActive") ? "bg-green-600" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${watch("isActive") ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Update Coupon" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
