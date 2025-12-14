import { z } from "zod";

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, "VITE_FIREBASE_API_KEY is required"),
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, "VITE_FIREBASE_AUTH_DOMAIN is required"),
  VITE_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, "VITE_FIREBASE_PROJECT_ID is required"),
  VITE_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, "VITE_FIREBASE_STORAGE_BUCKET is required"),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "VITE_FIREBASE_MESSAGING_SENDER_ID is required"),
  VITE_FIREBASE_APP_ID: z.string().min(1, "VITE_FIREBASE_APP_ID is required"),
  VITE_FIREBASE_MEASUREMENT_ID: z
    .string()
    .min(1, "VITE_FIREBASE_MEASUREMENT_ID is required"),

  VITE_BASE_URL: z.string().min(1, "VITE_BASE_URL is required"),
  VITE_AXIOS_TIMEOUT: z.string().min(1, "VITE_AXIOS_TIMEOUT is required"),

  VITE_RAZORPAY_KEY_ID: z.string().min(1, "VITE_RAZORPAY_KEY_ID is required"),
  VITE_SOCKET_URL: z.string().min(1, "VITE_SOCKET_URL is required"),
});

export const env = envSchema.parse(import.meta.env);
