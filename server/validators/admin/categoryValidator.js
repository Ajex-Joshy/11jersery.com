import Joi from "joi";

const categoryBaseSchema = {
  title: Joi.string().trim().min(1).messages({
    "string.base": "Title must be a string",
  }),

  cloudinaryImageId: Joi.string().messages({
    "string.base": "cloudinaryImageId must be a string",
  }),

  isListed: Joi.boolean().messages({
    "boolean.base": "isListed must be a boolean",
  }),

  inHome: Joi.boolean().messages({
    "boolean.base": "inHome must be a boolean",
  }),

  discount: Joi.number().min(0).default(0).messages({
    "number.base": "discount must be a number",
    "number.min": "discount must be a positive number",
  }),

  discountType: Joi.string()
    .valid("flat", "percent")
    .when("discount", {
      is: Joi.number().greater(0),
      then: Joi.required(),
      otherwise: Joi.optional().allow(null),
    })
    .messages({
      "any.required":
        "discountType is required and must be either flat or percent when discount > 0",
      "any.only": "discountType must be either flat or percent",
    }),

  maxRedeemable: Joi.number()
    .greater(0)
    .when("discount", {
      is: Joi.number().greater(0),
      then: Joi.required(),
      otherwise: Joi.optional().allow(null),
    })
    .messages({
      "any.required":
        "maxRedeemable must be greater than 0 when discount is applied",
      "number.greater":
        "maxRedeemable must be greater than 0 when discount is applied",
    }),
};

export const createCategorySchema = Joi.object({
  ...categoryBaseSchema,
  title: categoryBaseSchema.title.required().messages({
    "any.required": "Title is required",
    "string.empty": "Title is required",
  }),
});

export const updateCategorySchema = Joi.object({
  ...categoryBaseSchema,
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update the category",
  });
