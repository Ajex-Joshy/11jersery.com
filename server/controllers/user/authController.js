import {
  forgotPassword,
  signupUser,
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
  if (!email || !validator.isEmail(email))
    return next(new AppError(400, "VALIDATION_ERROR", "Invalid email"));
  const result = await forgotPassword(email);
  res.send(result);
};
