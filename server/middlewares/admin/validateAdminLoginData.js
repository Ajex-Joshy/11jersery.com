import validator from "validator";
import { AppError } from "../../utils/helpers.js";

export const validateLoginData = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError(400, "VALIDATION_ERROR", "All fields are required")
      );
    }

    if (!validator.isEmail(email)) {
      return next(new AppError(400, "VALIDATION_ERROR", "Enter a valid email"));
    }

    next();
  } catch (err) {
    next(new AppError(err));
  }
};
