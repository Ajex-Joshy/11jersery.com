import validator from "validator";
import { AppError } from "../../../utils/appError.js";

export const validateVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;

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

  if (!otp || validator.isEmpty(otp)) {
    return next(new AppError(400, "VALIDATION_ERROR", "OTP is required"));
  }

  if (!validator.isNumeric(otp) || otp.length !== 6) {
    return next(
      new AppError(400, "VALIDATION_ERROR", "OTP must be a 6-digit number")
    );
  }

  next();
};
