import validator from "validator";
import { AppError } from "../../../utils/appError.js";

export const validateResetPassword = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(
      new AppError(400, "VALIDATION_ERROR", "All fields are required")
    );
  }

  const strongPassword = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  if (!strongPassword) {
    return next(
      new AppError(
        400,
        "WEAK_PASSWORD",
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol"
      )
    );
  }

  if (password !== confirmPassword) {
    return next(
      new AppError(
        400,
        "PASSWORD_MISMATCH",
        "Password and Confirm Password do not match"
      )
    );
  }
  next();
};
