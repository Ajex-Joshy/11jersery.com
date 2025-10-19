import express from "express";
import { validateSignupData } from "../../middlewares/user/validators/validateSigupData.js";
import {
  forgotPasswordController,
  userLoginController,
  userSignupController,
  verifyOtpController,
} from "../../controllers/user/authController.js";
import { validateUserLoginData } from "../../middlewares/user/validators/validateUserLoginData.js";
import { otpLimiter } from "../../utils/otpUtils.js";
import { validateForgotPassword } from "../../middlewares/user/validators/validateForgotPassword.js";
import { validateVerifyOtp } from "../../middlewares/user/validators/validateVerifyOtp.js";

const router = express.Router();

router.post("/signup", validateSignupData, userSignupController);
router.post("/login", validateUserLoginData, userLoginController);
router.post(
  "/forgot-password",
  validateForgotPassword,
  otpLimiter,
  forgotPasswordController
);
router.post("/verify-otp", validateVerifyOtp, otpLimiter, verifyOtpController);

export default router;
