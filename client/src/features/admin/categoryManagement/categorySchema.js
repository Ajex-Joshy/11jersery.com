import { z } from "zod";

// --- Main Category Schema ---
export const categorySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Category name must be 3-100 characters")
      .max(30, "Category name must be 3-30 characters"),

    // --- Offer Control ---
    offerEnabled: z.boolean().default(false),

    // --- Offer Type ---
    // Optional, but required if offerEnabled is true
    discountType: z
      .enum(["flat", "percent"], {
        required_error: "Discount type is required when offer is enabled", // Add required_error
        invalid_type_error: "Invalid discount type selected",
      })
      .optional(),

    // --- Conditional Offer Fields ---
    // Make all specific offer fields optional initially
    discountAmount: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .min(0, "Amount cannot be negative")
      .optional(),
    minPurchaseAmount: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .min(0, "Min purchase cannot be negative")
      .optional(),
    discountPercentage: z.coerce
      .number({ invalid_type_error: "Percentage must be a number" })
      .min(0, "Percentage cannot be negative")
      .max(100, "Percentage cannot exceed 100")
      .optional(),
    maxRedeemable: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .min(0, "Max redeemable cannot be negative")
      .optional(),

    // --- Other Fields ---
    isListed: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
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
  .superRefine((data, ctx) => {
    // --- Conditional Validation ---
    if (data.offerEnabled) {
      // Discount Type is required if offer is enabled
      if (!data.discountType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountType"],
          message: "Please select a discount type when offer is enabled",
        });
      }
      // Flat Discount Validation
      else if (data.discountType === "flat") {
        if (
          data.discountAmount === undefined ||
          data.discountAmount === null ||
          isNaN(data.discountAmount)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discountAmount"],
            message: "Discount amount is required for flat discount",
          });
        }
        if (
          data.minPurchaseAmount === undefined ||
          data.minPurchaseAmount === null ||
          isNaN(data.minPurchaseAmount)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["minPurchaseAmount"],
            message: "Minimum purchase amount is required for flat discount",
          });
        }
        // Optional: Check if discountAmount <= minPurchaseAmount
        if (
          data.discountAmount >= 0 &&
          data.minPurchaseAmount >= 0 &&
          data.discountAmount > data.minPurchaseAmount
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discountAmount"],
            message: "Discount cannot be more than minimum purchase",
          });
        }
      }
      // Percent Discount Validation
      else if (data.discountType === "percent") {
        if (
          data.discountPercentage === undefined ||
          data.discountPercentage === null ||
          isNaN(data.discountPercentage)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discountPercentage"],
            message: "Discount percentage is required for percent discount",
          });
        }
        if (
          data.maxRedeemable === undefined ||
          data.maxRedeemable === null ||
          isNaN(data.maxRedeemable)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxRedeemable"],
            message: "Max redeemable amount is required for percent discount",
          });
        }
      }
    }

    // Image required check (adapt for Add vs Edit if needed)
    // if (!data.image) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     path: ["image"],
    //     message: "Header image is required",
    //   });
    // }
  });
