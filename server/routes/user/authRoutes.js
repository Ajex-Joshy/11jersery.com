import express from "express";
import { validateSignupData } from "../../middlewares/user/validators/validateSigupData.js";
import {
  forgotPasswordController,
  resetPasswordController,
  userLoginController,
  userSignupController,
  verifyOtpController,
} from "../../controllers/user/authController.js";
import { validateUserLoginData } from "../../middlewares/user/validators/validateUserLoginData.js";
import { otpLimiter } from "../../utils/otpUtils.js";
import { validateForgotPassword } from "../../middlewares/user/validators/validateForgotPassword.js";
import { validateVerifyOtp } from "../../middlewares/user/validators/validateVerifyOtp.js";
import { authenticateUser } from "../../middlewares/user/authenticateUser.js";
import { validateResetPassword } from "../../middlewares/user/validators/validateReseetPassword.js";

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
router.post(
  "/reset-password",
  validateResetPassword,
  authenticateUser,
  resetPasswordController
);

export default router;
