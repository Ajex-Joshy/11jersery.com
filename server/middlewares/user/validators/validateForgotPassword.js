import validator from "validator";
import { AppError } from "../../../utils/helpers.js";

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || validator.isEmpty(email)) {
    return next(new AppError(400, "VALIDATION_ERROR", "Email is required"));
  }

  if (!validator.isEmail(email)) {
    return next(
      new AppError(
        400,
        "VALIDATION_ERROR",
        "Please provide a valid email address"
      )
    );
  }

  next();
};
