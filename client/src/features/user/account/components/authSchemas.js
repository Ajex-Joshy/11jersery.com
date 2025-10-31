import { z } from "zod";

/**
 * Zod schema for the login form.
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }), // You can set a min(6) if your backend requires it
});

/**
 * Zod schema for the signup (registration) form.
 */
export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email address" }),
    phone: z
      .string()
      .trim() // Phone validation
      .min(10, { message: "Phone number must be at least 10 digits" })
      // Add a regex if you need to enforce a specific format, e.g., Indian mobile numbers
      // .regex(/^[6-9]\d{9}$/, { message: "Please enter a valid 10-digit mobile number" })
      .optional() // Make it optional
      .or(z.literal("")), // Allow empty string
    otp: z.string().optional(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Please confirm your password" }),
  })
  // Cross-field validation to ensure passwords match
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Apply the error to the confirmPassword field
  });
