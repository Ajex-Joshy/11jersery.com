// src/features/auth/components/SignupForm.jsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useSignup } from "../authHooks";
import { setAuthModalView } from "../authSlice";
import { signupSchema } from "./authSchemas";
import FormInput from "../../../../components/common/FormInput";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

// --- Import Firebase ---
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../../../config/firebaseConfig";
const SignupForm = () => {
  const { mutate: signupMutate, isLoading: isSigningUp } = useSignup();
  const dispatch = useDispatch();

  const [view, setView] = useState("form");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

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
      firstName: "Ajex",
      lastName: "Joshy",
      email: "test@gmail.com",
      phone: "+918547677320", // User will type +91
      password: "Test@123",
      confirmPassword: "Test@123",
      otp: "", // Add otp to default values
    },
  });

  // --- Firebase: Setup reCAPTCHA ---
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            toast.error("reCAPTCHA expired. Please try again.");
          },
        }
      );
    }
  }, []);

  // --- Firebase: Step 1 - Send OTP ---
  const handleSendOtp = async () => {
    // Validate all fields *except* OTP before sending
    const fieldsToValidate = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ];
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const phone = getValues("phone");
    const appVerifier = window.recaptchaVerifier;

    setIsSendingOtp(true);
    toast.loading("Sending OTP...");

    try {
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      console.log(result);
      setConfirmationResult(result);
      setView("otp"); // Switch to OTP view
      toast.dismiss();
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error(error.message || "Failed to send OTP.");
      // Reset reCAPTCHA if it fails
      if (
        window.grecaptcha &&
        window.recaptchaVerifier.widgetId !== undefined
      ) {
        window.grecaptcha.reset(window.recaptchaVerifier.widgetId);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // --- Firebase: Step 2 - Verify OTP & Final Submit ---
  // This is the main form's onSubmit
  const onSubmit = async (data) => {
    if (!confirmationResult) {
      toast.error("Please send and verify your OTP first.");
      return;
    }

    // Manually check if OTP is present (since it's optional in schema)
    if (!data.otp || data.otp.length !== 6) {
      setError("otp", { type: "manual", message: "OTP must be 6 digits." });
      return;
    }

    toast.loading("Verifying OTP...");

    try {
      // 1. Confirm the OTP with Firebase
      const userCredential = await confirmationResult.confirm(data.otp);
      const user = userCredential.user;

      // 2. Get the Firebase ID Token
      const firebaseToken = await user.getIdToken();
      toast.dismiss();

      // 3. Prepare data for *your* backend
      const { confirmPassword, otp, ...signupData } = data;

      // 4. Call your backend mutation
      signupMutate({
        ...signupData,
        firebaseToken, // Send the Firebase token for backend verification
      });
    } catch (error) {
      toast.dismiss();
      setError("otp", { type: "manual", message: "Invalid or expired OTP." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Invisible reCAPTCHA container */}
      <div
        id="recaptcha-container"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
        }}
      ></div>

      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

      {/* --- Fields visible in 'form' view --- */}
      <div className={view === "form" ? "space-y-4" : "hidden"}>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="signup-firstName"
            label="First Name"
            {...register("firstName")}
            error={errors.firstName?.message}
            autoComplete="given-name"
          />
          <FormInput
            id="signup-lastName"
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

      {/* --- Field visible in 'otp' view --- */}
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

      {/* --- Conditional Submit Button --- */}
      {view === "form" ? (
        <button
          type="button" // Important: Not a submit button
          onClick={handleSendOtp}
          disabled={isSendingOtp}
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center"
        >
          {isSendingOtp && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSendingOtp ? "Sending OTP..." : "Send OTP"}
        </button>
      ) : (
        <button
          type="submit" // This is the real submit button
          disabled={isSigningUp} // Disabled by the main mutation
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center"
        >
          {isSigningUp && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSigningUp ? "Creating Account..." : "Verify & Create Account"}
        </button>
      )}

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
