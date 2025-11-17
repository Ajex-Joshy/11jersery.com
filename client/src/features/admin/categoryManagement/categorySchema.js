import { z } from "zod";

export const categorySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Category name must be 3-100 characters")
      .max(30, "Category name must be 3-30 characters"),

    // Offer toggle
    offerEnabled: z.boolean().default(false),

    // discountType required only when offerEnabled = true
    discountType: z
      .union([
        z.enum(["flat", "percent"]),
        z.literal(""),
        z.null(),
        z.undefined(),
      ])
      .transform((val) => (val === "" ? undefined : val)),

    // Flat
    discountAmount: z.coerce.number().min(0).optional(),
    minPurchaseAmount: z.coerce.number().min(0).optional(),

    // Percent
    discountPercentage: z.coerce.number().min(0).max(100).optional(),
    maxRedeemable: z.coerce.number().min(0).optional(),

    isListed: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .default("true"),
    inHome: z.boolean().default(false),
    inCollections: z.boolean().default(false),

    image: z
      .union([z.instanceof(File), z.null(), z.undefined()])
      .refine(
        (file) => !file || file.size <= 5_000_000,
        "Image must be 5MB or less"
      )
      .refine(
        (file) =>
          !file ||
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Only .jpg, .png, and .webp formats are supported"
      ),
  })

  // ---- CONDITIONAL RULES ----
  .superRefine((data, ctx) => {
    // If offer is disabled → reset all discount fields
    if (!data.offerEnabled) {
      data.discountType = undefined;
      data.discountAmount = 0;
      data.minPurchaseAmount = 0;
      data.discountPercentage = 0;
      data.maxRedeemable = 0;
      return; // No further validation needed
    }

    // Offer is enabled → discountType must exist
    if (!data.discountType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountType"],
        message: "Please select a discount type when offer is enabled",
      });
      return;
    }

    // ---- Flat Discount ----
    if (data.discountType === "flat") {
      if (!data.discountAmount && data.discountAmount !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountAmount"],
          message: "Discount amount is required for flat discount",
        });
      }

      if (!data.minPurchaseAmount && data.minPurchaseAmount !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minPurchaseAmount"],
          message: "Minimum purchase amount is required for flat discount",
        });
      }

      if (
        data.discountAmount > 0 &&
        data.minPurchaseAmount > 0 &&
        data.discountAmount > data.minPurchaseAmount
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountAmount"],
          message: "Discount cannot be more than minimum purchase amount",
        });
      }
    }

    // ---- Percent Discount ----
    if (data.discountType === "percent") {
      if (!data.discountPercentage && data.discountPercentage !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountPercentage"],
          message: "Discount percentage is required for percent discount",
        });
      }

      if (!data.maxRedeemable && data.maxRedeemable !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxRedeemable"],
          message: "Max redeemable amount is required for percent discount",
        });
      }
    }
  });
