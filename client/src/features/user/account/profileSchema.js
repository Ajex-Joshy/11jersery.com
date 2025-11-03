import { z } from "zod";

export const personalDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),

  image: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "Image must be 2MB or less")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, or .webp"
    )
    .nullable()
    .optional(),

  gender: z
    .enum(["male", "female", "other"], {
      errorMap: () => ({ message: "Please select a gender" }),
    })
    .optional(),
  dob_day: z.string().optional(),
  dob_month: z.string().optional(),
  dob_year: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });
