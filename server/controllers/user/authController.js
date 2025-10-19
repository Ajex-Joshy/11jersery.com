import {
  requestOTP,
  signupUser,
  verifyOtp,
} from "../../services/user/authServices.js";
import { sendAuthResponse } from "../../utils/sendAuthResponse.js";
import { loginUser } from "../../services/user/authServices.js";
import validator from "validator";
import { AppError } from "../../utils/appError.js";

export const userSignupController = async (req, res, next) => {
  try {
    const { user, token } = await signupUser(req.body);
    sendAuthResponse(res, user, token, 201);
  } catch (err) {
    next(err);
  }
};

export const userLoginController = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    sendAuthResponse(res, user, token, 200);
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
