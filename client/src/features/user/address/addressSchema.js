import { z } from "zod";

export const addressSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(25, "Maximum 25 characters allowed"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(25, "Maximum 25 characters allowed"),
  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pin code must be 6 digits"),
  addressLine1: z
    .string()
    .trim()
    .min(5, "Address Line 1 is required")
    .max(100, "Maximum 100 characters allowed"),
  addressLine2: z
    .string()
    .trim()
    .max(100, "Maximum 100 characters allowed")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(50, "Maximum 50 characters allowed"),
  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(50, "Maximum 50 characters allowed"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(56, "Maximum 56 characters allowed"),
  phoneNumber: z
    .string()
    .trim()
    .max(13, "Maximum 13 characters including +91")
    .regex(/^(?:\+91)?[6-9]\d{9}$/, "Enter valid +91 number"),
  email: z.string().trim().email("Enter a valid email"),
  isDefault: z.boolean().default(false),
  addressName: z
    .string()
    .trim()
    .min(3, "Address name must be at least 3 characters")
    .max(50, "Address name must be at most 50 characters"),
});
