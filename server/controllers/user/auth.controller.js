import {
  forgotPassword,
  resetPassword,
  signupUser,
} from "../../services/user/auth.services.js";
import { AppError, sendResponse } from "../../utils/helpers.js";
import { loginUser } from "../../services/user/auth.services.js";
import { asyncHandler } from "../../utils/helpers.js";

export const userSignupController = asyncHandler(async (req, res) => {
  if (!req.body.firebaseToken) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Firebase verification token is missing."
    );
  }
  const { user, token } = await signupUser(req.body);
  sendResponse(res, { user, token }, 201);
});

export const userLoginController = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);
  sendResponse(res, { user, token }, 200);
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await forgotPassword(email);
  res.status(200).send(result);
});

export const verifyOtpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const result = await verifyOtp(email, otp);
  res.status(200).send(result);
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log(token, password);

  if (!password)
    throw new AppError(400, "VALIDATION_ERROR", "New password is required");

  const result = await resetPassword(token, password);
  res.status(200).send(result);
});
