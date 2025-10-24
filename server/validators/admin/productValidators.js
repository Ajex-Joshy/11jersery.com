import Joi from "joi";

const mongoIdSchema = Joi.string().hex().length(24).messages({
  "string.base": "ID must be a string",
  "string.hex": "Must be a valid Mongo ObjectId",
  "string.length": "Must be a valid Mongo ObjectId",
});

const priceSchema = Joi.object({
  list: Joi.number().min(0),
  sale: Joi.number().min(0).less(Joi.ref("list")).messages({
    "number.less": "Sale price must be less than or equal to list price",
  }),
});

const variantSchema = Joi.object({
  sku: Joi.string().trim().min(1),
  size: Joi.string().trim(),
  stock: Joi.number().integer().min(0),
});

export const createProductSchema = Joi.object({
  product: Joi.object({
    title: Joi.string().trim().min(1).required().messages({
      "any.required": "Product title is required",
      "string.empty": "Product title is required",
    }),

    description: Joi.string().trim().min(1).required().messages({
      "any.required": "Product description is required",
      "string.empty": "Product description is required",
    }),

    price: priceSchema
      .keys({
        list: Joi.number().min(0).required().messages({
          "any.required": "Product price.list is required and must be a number",
        }),
      })
      .required(),

    variants: Joi.array()
      .items(
        variantSchema.keys({
          sku: Joi.string().trim().min(1).required().messages({
            "any.required": "Variant sku is required",
            "string.empty": "Variant sku must be a non-empty string",
          }),
          stock: Joi.number().integer().min(0).required().messages({
            "any.required": "Variant stock is required",
          }),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "Product variants must be a non-empty array",
        "any.required": "Product variants are required",
      }),

    categoryIds: Joi.array()
      .items(mongoIdSchema) // Re-using the ObjectId schema
      .min(1)
      .required()
      .messages({
        "array.min": "Product categoryIds must be a non-empty array",
      }),

    cloudinaryImageIds: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        "array.min": "Product cloudinaryImageIds must be a non-empty array",
      }),

    isListed: Joi.boolean().required(),
  }).required(),
});

export const updateProductSchema = Joi.object({
  product: Joi.object({
    title: Joi.string().trim().min(3).max(100),
    description: Joi.string().max(2000),
    shortDescription: Joi.string().max(500),

    price: priceSchema.with("sale", "list").messages({
      "object.with": "List price is required when setting a sale price",
    }),

    variants: Joi.array().items(variantSchema),

    categoryIds: Joi.array().items(mongoIdSchema),

    tags: Joi.array().items(Joi.string()).max(10).messages({
      "array.max": "Tags array must not exceed 10 items",
    }),

    cloudinaryImageIds: Joi.array().items(Joi.string()),

    isListed: Joi.boolean(),
  }),

  faqs: Joi.array().items(
    Joi.object({
      question: Joi.string().trim().min(5).max(300),
      answer: Joi.string().trim().min(5).max(2000),
    })
  ),
})
  .min(1)
  .messages({
    "object.min": "At least one of product or faqs data is required for update",
  });
