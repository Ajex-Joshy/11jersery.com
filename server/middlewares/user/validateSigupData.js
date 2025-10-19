import { AppError } from "../../utils/appError.js";
import validator from "validator";

export const validateSignupData = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    const errors = [];

    // Validate firstName
    if (!firstName || !validator.isLength(firstName, { min: 2, max: 50 })) {
      errors.push("First name must be between 2 and 50 characters.");
    }

    // Validate lastName
    if (!lastName || !validator.isLength(lastName, { min: 2, max: 50 })) {
      errors.push("Last name must be between 2 and 50 characters.");
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
      errors.push("Invalid email address.");
    }

    // Validate password
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

    // Validate phone (10-digit Indian number)
    if (!phone || !validator.isMobilePhone(phone, "en-IN")) {
      errors.push("Invalid phone number.");
    }

    // If there are errors, pass them to AppError
    if (errors.length > 0) {
      return next(new AppError(400, "VALIDATION_ERROR", errors.join(" | ")));
    }

    // Everything is valid, proceed
    next();
  } catch (err) {
    next(err);
  }
};
