import {
  forgotPassword,
  refreshAcessToken,
  resetPassword,
  signupUser,
} from "../../services/user/auth.services.js";
import { AppError, sendResponse } from "../../utils/helpers.js";
import { loginUser } from "../../services/user/auth.services.js";
import { asyncHandler } from "../../utils/helpers.js";
import { setRefreshToken } from "../../utils/jwt.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const userSignupController = asyncHandler(async (req, res) => {
  if (!req.body.firebaseToken) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "VALIDATION_ERROR",
      "Firebase verification token is missing."
    );
  }
  const { user, accessToken, refreshToken } = await signupUser(req.body);
  setRefreshToken(res, refreshToken);
  sendResponse(res, { user, token: accessToken }, STATUS_CODES.CREATED);
});

export const refreshAcessTokenController = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "UNAUTHORIZED",
      "unauthorized"
    );
  const { accessToken, refreshToken } = await refreshAcessToken(token);
  setRefreshToken(res, refreshToken);
  res.status(STATUS_CODES.OK).json({ token: accessToken });
});

export const userLoginController = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);
  setRefreshToken(res, refreshToken);
  sendResponse(res, { user, token: accessToken }, STATUS_CODES.OK);
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await forgotPassword(email);
  res.status(STATUS_CODES.OK).send(result);
});

export const verifyOtpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const result = await verifyOtp(email, otp);
  res.status(STATUS_CODES.OK).send(result);
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "VALIDATION_ERROR",
      "New password is required"
    );

  const result = await resetPassword(token, password);
  res.status(STATUS_CODES.OK).send(result);
});
