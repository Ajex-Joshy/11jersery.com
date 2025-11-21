import Joi from "joi";
import { AppError } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const codOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().label("Product ID").messages({
          "any.required": "Product ID is required",
          "string.empty": "Product ID cannot be empty",
        }),

        size: Joi.string().required().messages({
          "any.required": "Product size is required",
        }),

        quantity: Joi.number().integer().min(1).max(10).required().messages({
          "number.base": "Quantity must be a number",
          "number.min": "Quantity must be at least 1",
          "number.max": "Quantity cannot exceed 10",
          "any.required": "Quantity is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Items must be an array",
      "array.min": "At least 1 item is required",
      "any.required": "Items field is required",
    }),

  shippingAddress: Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
      "any.required": "First name is required",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
    }),

    lastName: Joi.string().min(2).max(50).required().messages({
      "any.required": "Last name is required",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
    }),

    phone: Joi.string()
      .pattern(/^\+91[0-9]{10}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Phone number must be in +911234567890 format",
      }),

    pinCode: Joi.string()
      .pattern(/^[1-9][0-9]{5}$/)
      .required()
      .messages({
        "string.empty": "Pincode is required",
        "string.pattern.base": "Pincode must be a valid 6-digit number",
      }),

    state: Joi.string().min(2).max(50).required().messages({
      "any.required": "State is required",
      "string.min": "State must be at least 2 characters",
      "string.max": "State cannot exceed 50 characters",
    }),

    city: Joi.string().min(2).max(50).required().messages({
      "any.required": "City is required",
      "string.min": "City must be at least 2 characters",
      "string.max": "City cannot exceed 50 characters",
    }),

    country: Joi.string().min(2).max(50).required().messages({
      "any.required": "Country is required",
      "string.min": "Country must be at least 2 characters",
      "string.max": "Country cannot exceed 50 characters",
    }),

    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

    addressLine1: Joi.string().min(3).max(200).required().messages({
      "any.required": "Address Line 1 is required",
      "string.min": "Address Line 1 must be at least 3 characters",
      "string.max": "Address Line 1 cannot exceed 200 characters",
    }),

    addressLine2: Joi.string().max(200).allow("").messages({
      "string.max": "Address Line 2 cannot exceed 200 characters",
    }),
  })
    .required()
    .messages({
      "any.required": "Shipping address is required",
    }),
});

export const validateCodOrder = (req, res, next) => {
  const { error } = codOrderSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "VALIDATION_ERROR",
      error.details.map((err) => err.message)
    );
  }
  next();
};
