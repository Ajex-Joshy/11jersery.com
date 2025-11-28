import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .toUpperCase(),
    description: z.string().trim().min(5, "Description is required"),
    discountType: z.enum(["PERCENTAGE", "FIXED"], {
      required_error: "Select a discount type",
    }),

    discountValue: z.coerce.number().min(0.01, "Value must be greater than 0"),

    minPurchaseAmount: z.coerce.number().min(0).default(0),

    maxDiscountAmount: z.coerce.number().min(0).optional().or(z.literal("")),
    usageLimit: z.coerce.number().min(1).optional().or(z.literal("")),
    perUserLimit: z.coerce.number().min(1).default(1),

    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date/time"),
    expiryDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid expiry date/time"),

    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountValue"],
        message: "Percentage cannot exceed 100%",
      });
    }

    if (new Date(data.expiryDate) <= new Date(data.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiryDate"],
        message: "Expiry date must be after start date",
      });
    }
  });
