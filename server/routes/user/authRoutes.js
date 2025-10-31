import express from "express";
import {
  forgotPasswordController,
  resetPasswordController,
  userLoginController,
  userSignupController,
  verifyOtpController,
} from "../../controllers/user/authController.js";
import { otpLimiter } from "../../utils/otpUtils.js";
import { authenticateUser } from "../../middlewares/user/authenticateUser.js";

import { validate } from "../../middlewares/common/validate.js";
import {
  signupSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../../validators/user/authValidators.js";
import { loginSchema } from "../../validators/common/loginSchema.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), userSignupController);

router.post("/login", validate(loginSchema), userLoginController);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  otpLimiter,
  forgotPasswordController
);

router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  otpLimiter,
  verifyOtpController
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPasswordController
);

export default router;
