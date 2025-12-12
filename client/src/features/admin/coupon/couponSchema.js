import { z } from "zod";

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code cannot exceed 20 characters")
      .toUpperCase(),
    description: z
      .string()
      .trim()
      .min(5, "Description is required")
      .max(200, "Description cannot exceed 200 characters"),
    discountType: z.enum(["PERCENTAGE", "FIXED"], {
      required_error: "Select a discount type",
    }),
    discountValue: z.coerce
      .number()
      .min(0.01, "Value must be greater than 0")
      .max(1000000, "Discount value too high"), // Adjust as needed
    minPurchaseAmount: z.coerce
      .number()
      .min(0, "Minimum purchase cannot be negative")
      .max(1000000, "Minimum purchase too high"),
    maxDiscountAmount: z.coerce
      .number()
      .min(0, "Max discount cannot be negative")
      .max(1000000, "Max discount too high")
      .optional()
      .or(z.literal("")),
    usageLimit: z.coerce
      .number()
      .min(1, "Usage limit must be at least 1")
      .max(100000, "Usage limit too high")
      .optional()
      .or(z.literal("")),
    perUserLimit: z.coerce
      .number()
      .min(1, "Per user limit must be at least 1")
      .max(1000, "Per user limit too high")
      .default(1),
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
