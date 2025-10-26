import { z } from "zod";

export const categorySchema = z.object({
  title: z.string().min(3, "Category name must be at least 3 characters"),

  // Use `coerce` to automatically convert the form's string value to a number
  categoryOffer: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Offer can't be negative")
    .default(0),

  maxRedeemable: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Must be at least 0")
    .default(0),

  discountType: z.enum(["flat", "percent"], {
    errorMap: () => ({ message: "Please select a discount type" }),
  }),
  isListed: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .default("true"),
  inHome: z.boolean().default(false),
  inCollections: z.boolean().default(false),

  image: z
    .instanceof(File, { message: "Header image is required" })
    .refine(
      (file) => file.size <= 5_000_000, // 5MB limit
      "Image must be 5MB or less (after crop)"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported"
    ),
});
