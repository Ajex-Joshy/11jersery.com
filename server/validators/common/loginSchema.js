import Joi from "joi";

export const loginSchema = Joi.object({
  identifier: Joi.alternatives().try(Joi.string().email()).required().messages({
    "any.required": "email is required",
    "alternatives.match": "email must be a valid email",
  }),

  password: Joi.string().min(8).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters long",
  }),
});
