import {
  requestOTP,
  resetPassword,
  signupUser,
  verifyOtp,
} from "../../services/user/authServices.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { loginUser } from "../../services/user/authServices.js";

export const userSignupController = async (req, res, next) => {
  try {
    const { user, token } = await signupUser(req.body);
    sendResponse(res, { user, token }, 201);
  } catch (err) {
    next(err);
  }
};

export const userLoginController = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    sendResponse(res, { user, token }, 200);
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  const { email } = req.body;
  const result = await requestOTP(email);
  res.status(200).send(result);
};

export const verifyOtpController = async (req, res, next) => {
  const { email, otp } = req.body;

  const result = await verifyOtp(email, otp);
  res.status(200).send(result);
};

export const resetPasswordController = async (req, res, next) => {
  const { password } = req.body;
  const user = req.user;
  const result = await resetPassword(user, password);
  res.status(200).send(result);
};
