import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pin code must be 6 digits"),
  addressLine1: z.string().trim().min(5, "Address Line 1 is required"),
  addressLine2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().min(1, "Country is required"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^(?:\+91)?[6-9]\d{9}$/, "Enter valid +91 number"),
  email: z.string().trim().email("Enter a valid email"),
  isDefault: z.boolean().default(false),
  addressName: z
    .string()
    .trim()
    .min(3, "Address name must be at least 3 characters")
    .max(50, "Address name must be at most 50 characters"),
});
