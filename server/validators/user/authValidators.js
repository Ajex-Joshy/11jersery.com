import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "any.required": "OTP is required",
      "string.empty": "OTP is required",
      "string.pattern.base": "OTP must be a 6-digit number",
    }),
});

export const resetPasswordSchema = Joi.object({
  password: passwordComplexity({
    // 2. Use passwordComplexity here
    min: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
    .required()
    .messages({
      "any.required": "Password is required",
      // 3. The error message key changes
      "password.complexity":
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({
      "any.required": "Confirm Password is required",
      "any.only": "Password and Confirm Password do not match",
    }),
});

// Reusable name validation
const nameValidation = (label) =>
  Joi.string()
    .pattern(/^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/)
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.base": `${label} must be a text value`,
      "string.empty": `${label} is required`,
      "string.pattern.base": `${label} should contain only letters and optional spaces, hyphens, or apostrophes`,
      "string.min": `${label} must be at least 3 characters long`,
      "string.max": `${label} must not exceed 30 characters`,
      "any.required": `${label} is required`,
    });

export const signupSchema = Joi.object({
  firstName: nameValidation("First name"),
  lastName: nameValidation("Last name"),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
  }),

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid 10-digit phone number",
    }),

  password: passwordComplexity({
    min: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
    .required()
    .messages({
      "any.required": "Password is required",
      "password.complexity":
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol",
    }),
});
