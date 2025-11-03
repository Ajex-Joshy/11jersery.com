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
    min: 8,
    max: 26,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  })
    .required()
    .messages({
      "any.required": "Password is required",
      "passwordComplexity.tooShort":
        "Password must be at least 8 characters long",
      "passwordComplexity.uppercase":
        "Password must include at least one uppercase letter",
      "passwordComplexity.lowercase":
        "Password must include at least one lowercase letter",
      "passwordComplexity.numeric": "Password must include at least one number",
      "passwordComplexity.symbol":
        "Password must include at least one special symbol",
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
    .pattern(/^(\+91[\-\s]?)?[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Please provide a valid 10-digit phone number",
    }),

  password: passwordComplexity({
    min: 8,
    max: 26,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  })
    .required()
    .messages({
      "any.required": "Password is required",
      "passwordComplexity.tooShort":
        "Password must be at least 8 characters long",
      "passwordComplexity.uppercase":
        "Password must include at least one uppercase letter",
      "passwordComplexity.lowercase":
        "Password must include at least one lowercase letter",
      "passwordComplexity.numeric": "Password must include at least one number",
      "passwordComplexity.symbol":
        "Password must include at least one special symbol",
    }),
  imageId: Joi.string().optional(),
  firebaseToken: Joi.string().required().messages({
    "string.base": "Firebase token must be a string",
    "string.empty": "Firebase token is required",
    "any.required": "Firebase token is required",
  }),
});
