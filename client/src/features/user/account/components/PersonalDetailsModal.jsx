import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { personalDetailsSchema } from "../profileSchema.js";
import { useUpdatePersonalDetails } from "../userHooks";
import { FormInput } from "../../../../components/common/FormComponents.jsx";
import toast from "react-hot-toast";
import { useRequestEmailOtp, useConfirmEmailChange } from "../userHooks";
import PropTypes from "prop-types";

export const PersonalDetailsModal = ({ isOpen, onClose, user }) => {
  const { mutate, isLoading } = useUpdatePersonalDetails();
  const { mutate: sendOtpMutate, isLoading: isSendingOtp } =
    useRequestEmailOtp();
  const { mutate: verifyOtpMutate, isLoading: isVerifyingOtp } =
    useConfirmEmailChange();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(personalDetailsSchema),
  });

  const [emailChanged, setEmailChanged] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const watchedEmail = watch("email", "");
  const watchedOtp = watch("otp", "");

  // Populate form with user data when modal opens or user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        otp: "",
      });
      setEmailChanged(false);
      setOtpSent(false);
      setOtpVerified(false);
      clearErrors("otp");
    }
  }, [user, isOpen, reset, clearErrors]);

  useEffect(() => {
    console.log(watchedEmail, user.email);
    if (user) {
      setEmailChanged(watchedEmail !== user.email);
      if (watchedEmail === user.email) {
        setOtpSent(false);
        setOtpVerified(false);
        clearErrors("otp");
      }
    }
  }, [watchedEmail, user, clearErrors]);

  const onSendOtp = () => {
    if (!watchedEmail || watchedEmail === user.email) {
      toast.error("Please enter a new email to send OTP.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(watchedEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    sendOtpMutate(
      { newEmail: watchedEmail },
      {
        onSuccess: () => {
          toast.success("OTP sent to new email.");
          setOtpSent(true);
          setOtpVerified(false);
          clearErrors("otp");
        },
        onError: (error) => {
          console.log(error);
          toast.error(
            error?.response?.data?.error?.message || "Failed to send OTP."
          );
        },
      }
    );
  };

  const onVerifyOtp = () => {
    if (!watchedOtp) {
      setError("otp", { type: "manual", message: "Please enter the OTP." });
      return;
    }
    verifyOtpMutate(
      { newEmail: watchedEmail, otp: watchedOtp },
      {
        onSuccess: () => {
          toast.success("Email verified.");
          setOtpVerified(true);
          clearErrors("otp");
        },
        onError: (error) => {
          setError("otp", {
            type: "manual",
            message: error?.message || "Invalid OTP.",
          });
        },
      }
    );
  };

  const onSubmit = (data) => {
    const changedFields = {};

    // Validate name lengths
    if (!data.firstName?.trim() || data.firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters.");
      return;
    }
    if (!data.lastName?.trim() || data.lastName.trim().length < 2) {
      toast.error("Last name must be at least 2 characters.");
      return;
    }

    // Validate max lengths
    if (data.firstName.trim().length > 25) {
      toast.error("First name cannot exceed 25 characters.");
      return;
    }
    if (data.lastName.trim().length > 25) {
      toast.error("Last name cannot exceed 25 characters.");
      return;
    }

    if (data.firstName !== user.firstName) {
      changedFields.firstName = data.firstName;
      console.log(data.firstName, user.firstName, changedFields);
    }

    if (data.lastName !== user.lastName) changedFields.lastName = data.lastName;
    {
      console.log("data", data);
      console.log(data.email, user.email);
    }
    if (data.email) {
      if (data.email !== user.email) {
        if (!otpVerified) {
          toast.error("Please verify your new email before saving.");
          return;
        }
        if (!data.email?.trim()) {
          toast.error("Email is required.");
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          toast.error("Invalid email format.");
          return;
        }
        changedFields.email = data.email;
      }
    }
    console.log("changedFields", changedFields);

    if (Object.keys(changedFields).length > 0) {
      mutate(changedFields, {
        onSuccess: () => onClose(),
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
          <FormInput
            id="email"
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          {emailChanged && (
            <div className="space-y-2">
              {!otpSent && (
                <button
                  type="button"
                  onClick={onSendOtp}
                  disabled={isSendingOtp}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Send OTP"
                  )}
                </button>
              )}
              {otpSent && (
                <>
                  <FormInput
                    id="otp"
                    label="Enter OTP"
                    {...register("otp")}
                    error={errors.otp?.message}
                  />
                  <button
                    type="button"
                    onClick={onVerifyOtp}
                    disabled={isVerifyingOtp || otpVerified}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : otpVerified ? (
                      "OTP Verified"
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (emailChanged && !otpVerified)}
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

PersonalDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
};

export default PersonalDetailsModal;
