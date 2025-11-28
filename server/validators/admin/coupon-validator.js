import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  description: Joi.string().required(),

  discountType: Joi.string().valid("PERCENTAGE", "FIXED").required(),

  discountValue: Joi.number()
    .required()
    .min(0)
    .when("discountType", {
      is: "PERCENTAGE",
      then: Joi.number()
        .max(100)
        .message("Percentage discount cannot exceed 100"),
    }),

  minPurchaseAmount: Joi.number().min(0).default(0),

  maxDiscountAmount: Joi.number().allow(null).default(null),

  usageLimit: Joi.number().allow(null, "").default(null),
  usedCount: Joi.number().default(0),
  perUserLimit: Joi.number().min(1).default(1),

  startDate: Joi.date().default(Date.now),
  expiryDate: Joi.date().greater(Joi.ref("startDate")).required(),

  isActive: Joi.boolean().default(true),
});

export const updateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase(),
  description: Joi.string(),

  discountType: Joi.string().valid("PERCENTAGE", "FIXED"),

  discountValue: Joi.number()
    .min(0)
    .when("discountType", {
      is: "PERCENTAGE",
      then: Joi.number()
        .max(100)
        .message("Percentage discount cannot exceed 100"),
    }),

  minPurchaseAmount: Joi.number().min(0),

  maxDiscountAmount: Joi.number().allow(null),

  usageLimit: Joi.number().allow(""),
  usedCount: Joi.number(),
  perUserLimit: Joi.number().min(1),

  startDate: Joi.date(),
  expiryDate: Joi.date().greater(Joi.ref("startDate")),

  isActive: Joi.boolean(),
}).min(1);
