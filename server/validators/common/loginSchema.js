import Joi from "joi";

export const loginSchema = Joi.object({
  identifier: Joi.alternatives()
    .try(
      Joi.string().email(),
      Joi.string().pattern(
        /^[6-9]\d{9}$/ // Validates 10-digit Indian mobile number
      )
    )
    .required()
    .messages({
      "any.required": "Identifier is required",
      "alternatives.match":
        "Identifier must be a valid email or 10-digit phone number",
    }),

  password: Joi.string().min(8).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 8 characters long",
  }),
});
