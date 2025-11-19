import Joi from "joi";

const addressSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  pinCode: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  addressLine1: Joi.string().min(5).required(),
  addressLine2: Joi.string().allow("").optional(),
  city: Joi.string().min(2).required(),
  state: Joi.string().min(2).required(),
  country: Joi.string().min(2).default("India"),
  phoneNumber: Joi.string()
    .pattern(/^(?:\+91)?[6-9]\d{9}$/)
    .required(),
  email: Joi.string().email().required(),
  addressName: Joi.string().trim().min(3).max(50).required(),
  isDefault: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
});

const editAddressSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  pinCode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional(),
  addressLine1: Joi.string().min(5).optional(),
  addressLine2: Joi.string().allow("").optional(),
  city: Joi.string().min(2).optional(),
  state: Joi.string().min(2).optional(),
  country: Joi.string().min(2).optional(),
  phoneNumber: Joi.string()
    .pattern(/^(?:\+91)?[6-9]\d{9}$/)
    .optional(),
  email: Joi.string().email().optional(),
  addressName: Joi.string().trim().min(3).max(50).optional(),
  isDefault: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
}).min(1); // Ensure at least one field is updated

export const validateCreateAddress = (req, res, next) => {
  const { error } = addressSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const validateEditAddress = (req, res, next) => {
  const { error } = editAddressSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};
