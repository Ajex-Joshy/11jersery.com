// src/features/auth/components/SignupForm.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useSignup } from "../authHooks";
import { setAuthModalView } from "../authSlice";
import { signupSchema } from "./authSchemas";
import { FormInput } from "../../../../components/common/FormComponents";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

// import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// import { auth } from "../../../../config/firebaseConfig";
const SignupForm = () => {
  const { mutate: signupMutate, isLoading: isSigningUp } = useSignup();
  const dispatch = useDispatch();

  // const [view, setView] = useState("form");
  // const [isSendingOtp, setIsSendingOtp] = useState(false);
  // const [confirmationResult, setConfirmationResult] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setError,
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      phone: "+919876543210",
      password: "Test@123",
      confirmPassword: "Test@123",
    },
  });

  // --- Firebase: Setup reCAPTCHA ---
  // useEffect(() => {
  //   if (!window.recaptchaVerifier) {
  //     window.recaptchaVerifier = new RecaptchaVerifier(
  //       auth,
  //       "recaptcha-container",
  //       {
  //         size: "invisible",
  //         callback: () => {
  //           console.log("reCAPTCHA solved");
  //         },
  //         "expired-callback": () => {
  //           toast.error("reCAPTCHA expired. Please try again.");
  //         },
  //       }
  //     );
  //   }
  // }, []);

  // const handleSendOtp = async () => {
  //   const fieldsToValidate = [
  //     "firstName",
  //     "lastName",
  //     "email",
  //     "phone",
  //     "password",
  //     "confirmPassword",
  //   ];
  //   const isValid = await trigger(fieldsToValidate);

  //   if (!isValid) {
  //     toast.error("Please fill in all required fields correctly.");
  //     return;
  //   }

  //   const phone = getValues("phone");
  //   const appVerifier = window.recaptchaVerifier;

  //   setIsSendingOtp(true);
  //   toast.loading("Sending OTP...");

  //   try {
  //     const result = await signInWithPhoneNumber(auth, phone, appVerifier);
  //     setConfirmationResult(result);
  //     setView("otp"); // Switch to OTP view
  //     toast.dismiss();
  //     toast.success("OTP sent successfully!");
  //   } catch (error) {
  //     toast.dismiss();
  //     toast.error(error.message || "Failed to send OTP.");
  //     // Reset reCAPTCHA if it fails
  //     if (
  //       window.grecaptcha &&
  //       window.recaptchaVerifier.widgetId !== undefined
  //     ) {
  //       window.grecaptcha.reset(window.recaptchaVerifier.widgetId);
  //     }
  //   } finally {
  //     setIsSendingOtp(false);
  //   }
  // };

  const onSubmit = async (data) => {
    const {
      confirmPassword: _confirmPassword,
      otp: _otp,
      ...signupData
    } = data;

    signupMutate({
      ...signupData,
      firebaseToken: "",
      referralCode: localStorage.getItem("referral-code") || null,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 
      <div
        id="recaptcha-container"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
        }}
      ></div>
      */}

      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

      {/* --- Fields visible in 'form' view --- */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="signup-firstName"
            label="First Name"
            placeholder="John"
            {...register("firstName")}
            error={errors.firstName?.message}
            autoComplete="given-name"
          />
          <FormInput
            id="signup-lastName"
            placeholder="Doe"
            label="Last Name"
            {...register("lastName")}
            error={errors.lastName?.message}
            autoComplete="family-name"
          />
        </div>
        <FormInput
          id="signup-email"
          label="Email Address"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormInput
          id="signup-phone"
          label="Phone Number"
          type="tel"
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="+919876543210"
          autoComplete="tel"
        />
        <FormInput
          id="signup-password"
          label="Password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />
        <FormInput
          id="signup-confirmPassword"
          label="Confirm Password"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
      </div>

      {/* 
      {view === "otp" && (
        <FormInput
          id="signup-otp"
          label="Enter 6-Digit OTP"
          type="text"
          maxLength={6}
          {...register("otp")}
          error={errors.otp?.message}
          placeholder="123456"
          autoComplete="one-time-code"
          className="tracking-[0.3em] text-center" // Adds spacing
        />
      )}
      */}

      <button
        type="submit"
        disabled={isSigningUp}
        className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center"
      >
        {isSigningUp && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isSigningUp ? "Creating Account..." : "Create Account"}
      </button>

      {/* --- Switch to Login --- */}
      <p className="text-sm text-center text-gray-600 pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => dispatch(setAuthModalView("login"))}
          className="font-medium text-blue-600 hover:underline"
        >
          Login
        </button>
      </p>
    </form>
  );
};

export default SignupForm;
