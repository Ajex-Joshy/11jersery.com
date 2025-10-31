// src/features/products/productSchema.js
import { z } from "zod";

// Define the structure for variants (sizes)
const variantSchema = z.object({
  size: z.string(), // e.g., "XS", "S", etc.
  stock: z.coerce // Convert input string to number
    .number({ invalid_type_error: "Stock must be a number" })
    .min(0, "Stock cannot be negative")
    .default(0),
});

// Define the structure for FAQs
const faqSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
});

// Define the main product schema
export const productSchema = z
  .object({
    // Basic Details
    title: z
      .string()
      .min(3, "Product title must be at least 3 characters")
      .max(100, "Product title cannot exceed 100 characters."),
    description: z
      .string()
      .min(10, "Description is too short")
      .max(2000, "Product title cannot exceed 2000 characters."),
    shortDescription: z
      .string()
      .min(10, "Short description is too short")
      .max(500, "Product title cannot exceed 500 characters."),

    // Pricing
    priceList: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .positive("List price must be positive"),
    priceSale: z.coerce
      .number({ invalid_type_error: "Must be a number" })
      .positive("Sale price must be positive"),

    // Inventory (Variants) - Validate the array structure
    variants: z
      .array(variantSchema)
      .min(1, "At least one size/stock is required"),

    // Categories & Tags - react-select gives objects, we need array of strings (IDs/values)
    categoryIds: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .min(1, "Select at least one category")
      .transform((items) => items.map((item) => item.value)), // Extract IDs
    tags: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .transform((items) => items.map((item) => item.value)) // Extract tag values
      .optional(),

    // Status
    isListed: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .default("true"),

    // Product Details (Optional Fields)
    detailsMaterial: z.string().optional(),
    detailsFitType: z.string().optional(),
    detailsNeckType: z.string().optional(),
    detailsSleeveType: z.string().optional(),
    detailsInstructions: z.string().optional(),

    // FAQs - Validate the array structure
    faqs: z.array(faqSchema).optional(),

    // Images - For simplicity, starting with one required image. Expand later.
    // We'll use the File object from the cropper.
    images: z
      .array(z.instanceof(File))
      // .min(3, "At least three product image is required")
      .refine(
        (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
        `Each image must be 5MB or less.`
      )
      .refine(
        (files) =>
          files.every((file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type)
          ),
        "Only .jpg, .png, and .webp formats are supported."
      ),

    // --- Cover Image Index ---
    // Stores the index of the cover image within the 'images' array
    coverImageIndex: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .refine((data) => !data.priceSale || data.priceSale <= data.priceList, {
        /* price check */
      }),

    // --- Refine to ensure coverImageIndex is valid for the images array ---
  })
  .refine((data) => data.priceSale <= data.priceList, {
    message: "Sale price cannot be greater than list price",
    path: ["priceSale"],
  });
