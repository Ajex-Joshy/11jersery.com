import validator from "validator";
import { AppError } from "../../../utils/appError.js";

export const validateUserLoginData = (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Identifier and password are required"
        )
      );
    }

    const isEmail = validator.isEmail(identifier);
    const isPhone = validator.isMobilePhone(identifier, "en-IN");

    if (!isEmail && !isPhone) {
      return next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Identifier must be a valid email or 10-digit phone number"
        )
      );
    }

    if (!validator.isLength(password, { min: 8 })) {
      return next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Password must be at least 8 characters long"
        )
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
