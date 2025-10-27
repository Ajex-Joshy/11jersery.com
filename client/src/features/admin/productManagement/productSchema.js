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
export const productSchema = z.object({
  // Basic Details
  title: z.string().min(3, "Product title must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description is too short")
    .optional()
    .or(z.literal("")),
  shortDescription: z
    .string()
    .min(10, "Short description is too short")
    .optional()
    .or(z.literal("")),

  // Pricing
  priceList: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("List price must be positive"),
  priceSale: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .positive("Sale price must be positive"),
  // .refine((data) => data.priceSale <= data.priceList, {
  //   message: "Sale price cannot be greater than list price",
  // }),

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
  image: z
    .instanceof(File, { message: "Main product image is required" })
    .refine((file) => file.size <= 5_000_000, `Max file size is 5MB.`)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png and .webp formats are supported."
    ),
  // TODO: Add validation for secondary images when implemented
});
