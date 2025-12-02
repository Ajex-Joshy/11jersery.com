import express from "express";
import {
  forgotPasswordController,
  logoutController,
  refreshAcessTokenController,
  resetPasswordController,
  userLoginController,
  userSignupController,
} from "../../controllers/user/auth.controller.js";
import { otpLimiter } from "../../utils/otp.utils.js";

import { validate } from "../../middlewares/common/validate.js";
import {
  signupSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../../validators/user/auth-validators.js";
import { loginSchema } from "../../validators/common/login-schema.js";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), userSignupController);

router.post("/login", validate(loginSchema), userLoginController);

router.post("/refresh-token", refreshAcessTokenController);

router.post("/logout", authenticateUser, logoutController);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  otpLimiter,
  forgotPasswordController
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPasswordController
);

export default router;
