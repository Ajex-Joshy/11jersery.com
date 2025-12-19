import { z } from "zod";

/**
 * Strict Zod schema for the login form.
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .min(5, { message: "Email must be at least 5 characters" })
    .max(50, { message: "Email must be at most 50 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be at most 20 characters" }),
});

/**
 * Strict Zod schema for the signup (registration) form.
 */
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, { message: "First name must be at least 2 characters" })
      .max(30, { message: "First name must be at most 30 characters" }),
    lastName: z
      .string()
      .trim()
      .min(1, { message: "Last name must be at least 2 characters" })
      .max(30, { message: "Last name must be at most 30 characters" }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email address" })
      .min(5, { message: "Email must be at least 5 characters" })
      .max(50, { message: "Email must be at most 50 characters" }),
    phone: z
      .string()
      .trim()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .max(15, { message: "Phone number must be at most 15 digits" })
      .regex(/^\+?[0-9]+$/, {
        message: "Phone number must contain only digits",
      })
      .optional()
      .or(z.literal("")),
    // otp: z
    //   .string()
    //   .length(6, { message: "OTP must be exactly 6 digits" })
    //   .optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(20, { message: "Password must be at most 20 characters" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" })
      .max(20, { message: "Confirm password must be at most 20 characters" }),
  })
  // Cross-field validation to ensure passwords match
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
