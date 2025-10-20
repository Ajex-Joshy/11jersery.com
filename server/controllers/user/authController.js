import {
  requestOTP,
  resetPassword,
  signupUser,
  verifyOtp,
} from "../../services/user/authServices.js";
import { sendResponse } from "../../utils/helpers.js";
import { loginUser } from "../../services/user/authServices.js";
import { asyncHandler } from "../../utils/helpers.js";

export const userSignupController = asyncHandler(async (req, res, next) => {
  const { user, token } = await signupUser(req.body);
  sendResponse(res, { user, token }, 201);
});

export const userLoginController = asyncHandler(async (req, res, next) => {
  const { user, token } = await loginUser(req.body);
  sendResponse(res, { user, token }, 200);
});

export const forgotPasswordController = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const result = await requestOTP(email);
  res.status(200).send(result);
});

export const verifyOtpController = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const result = await verifyOtp(email, otp);
  res.status(200).send(result);
});

export const resetPasswordController = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const user = req.user;
  const result = await resetPassword(user, password);
  res.status(200).send(result);
});
