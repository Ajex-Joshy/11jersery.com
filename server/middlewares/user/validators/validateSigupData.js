import { AppError } from "../../../utils/appError.js";
import validator from "validator";

export const validateSignupData = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const errors = [];

    if (!firstName || !validator.isLength(firstName, { min: 2, max: 50 })) {
      errors.push("First name must be between 2 and 50 characters.");
    }

    if (!lastName || !validator.isLength(lastName, { min: 2, max: 50 })) {
      errors.push("Last name must be between 2 and 50 characters.");
    }

    if (!email || !validator.isEmail(email)) {
      errors.push("Invalid email address.");
    }

    if (!password || !validator.isLength(password, { min: 8 })) {
      errors.push("Password must be at least 8 characters long.");
    } else {
      if (
        !validator.matches(password, /[a-zA-Z]/) ||
        !validator.matches(password, /\d/) ||
        !validator.matches(password, /[!@#$%^&*(),.?":{}|<>]/)
      ) {
        errors.push(
          "Password must include at least one letter, one number, and one symbol."
        );
      }
    }

    if (!phone || !validator.isMobilePhone(phone, "en-IN")) {
      errors.push("Invalid phone number.");
    }

    if (errors.length > 0) {
      return next(new AppError(400, "VALIDATION_ERROR", errors.join(" | ")));
    }

    next();
  } catch (err) {
    next(err);
  }
};
