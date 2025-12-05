import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { addressSchema } from "./addressSchema";
import {
  useAddAddress,
  useGetAddressById,
  useUpdateAddress,
} from "./addressHooks";
import toast from "react-hot-toast";
import { FormInput } from "../../../components/common/FormComponents";
import { indianStates } from "../../../utils/constants";
const AddAddressPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams();
  const { mutate: addAddress, isLoading: isAdding } = useAddAddress();
  const { mutate: updateAddress, isLoading: isUpdating } = useUpdateAddress();

  const isEditMode = Boolean(addressId && addressId !== "new");

  const { data: addressData, isLoading: isFetching } = useGetAddressById(
    addressId,
    { enabled: isEditMode }
  );

  // const addressData = {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      pinCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Kerala",
      country: "India",
      phoneNumber: "+91",
      email: "",
      isDefault: false,
      type: "Home",
      addressName: "",
    },
  });

  useEffect(() => {
    if (addressData?.data?.address) {
      reset(addressData.data.address);
    }
  }, [addressData, reset]);

  const onSubmit = (data) => {
    if (isEditMode) {
      console.log("id", addressId);
      updateAddress(
        { addressId, data },
        {
          onSuccess: () => {
            toast.success("Address updated successfully!");
            navigate("/account/addresses");
          },
          onError: (err) => {
            toast.error(
              err.response?.data?.message || "Failed to update address"
            );
          },
        }
      );
    } else {
      addAddress(data, {
        onSuccess: () => {
          toast.success("Address added successfully!");
          navigate("/account/addresses");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to add address");
        },
      });
    }
  };

  const isLoading = isAdding || isUpdating || (addressId && isFetching);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-black"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {addressId ? "Edit Address" : "Add New Address"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200 space-y-6"
      >
        {/* Section: Shipping Address */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Enter Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              id="firstName"
              label="First Name*"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <FormInput
              label="Last Name*"
              id="lastName"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
          </div>
          <div className="mb-4">
            <FormInput
              label="Pin Code*"
              id="pinCode"
              {...register("pinCode")}
              error={errors.pinCode?.message}
            />
          </div>
          <div className="mb-4">
            <FormInput
              label="Address Line 1*"
              id="addressLine1"
              {...register("addressLine1")}
              error={errors.addressLine1?.message}
            />
          </div>
          <div className="mb-4">
            <FormInput
              label="Address Line 2"
              id="addressLine2"
              {...register("addressLine2")}
              error={errors.addressLine2?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* State Dropdown */}
            <div className="flex flex-col">
              <label
                htmlFor="state"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                State*
              </label>
              <select
                id="state"
                {...register("state")}
                className="border border-gray-300 p-3 rounded-md text-sm"
              >
                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && (
                <span className="text-red-600 text-xs mt-1">
                  {errors.state.message}
                </span>
              )}
            </div>
            {/* City Dropdown or Input */}
            <div className="flex flex-col">
              <label
                htmlFor="city"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                City*
              </label>
              <input
                id="city"
                className="border border-gray-300 p-3 rounded-md text-sm"
                {...register("city")}
                placeholder="City"
              />
              {errors.city && (
                <span className="text-red-600 text-xs mt-1">
                  {errors.city.message}
                </span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <FormInput
              label="Country"
              id="country"
              {...register("country")}
              error={errors.country?.message}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        {/* Section: Contact Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Enter Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Phone Number*"
              id="phoneNumber"
              {...register("phoneNumber")}
              error={errors.phoneNumber?.message}
            />
            <FormInput
              label="Email"
              id="email"
              {...register("email")}
              error={errors.email?.message}
            />
          </div>

          {/* Default Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="form-checkbox text-black rounded focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">
              Set as default
            </span>
          </label>
        </div>

        {/* Section: Address Name / Type */}
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="grow">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Name
            </label>
            <input
              type="text"
              id="addressName"
              {...register("addressName")}
              className="border border-gray-300 p-3 rounded-md text-sm w-full"
              placeholder="Enter address name"
            />
            {errors.addressName && (
              <span className="text-red-600 text-xs mt-1">
                {errors.addressName.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 min-w-[200px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Save Address"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAddressPage;
