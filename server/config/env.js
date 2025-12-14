import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let nodeEnv = process.env.NODE_ENV;
if (!nodeEnv) {
  nodeEnv = "development";
  process.env.NODE_ENV = nodeEnv;
}

const envFileMap = {
  development: ".env.development",
  production: ".env.production",
};

const envFile = envFileMap[nodeEnv];
const envPath = path.resolve(__dirname, "..", envFile);

dotenv.config({ path: envPath });

// Zod schema
const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  PORT: z.string().default("3000"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),

  NODE_ENV: z.enum(["development", "production"]).default("development"),

  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
  AWS_S3_BUCKET_NAME: z.string().min(1, "AWS_S3_BUCKET_NAME is required"),
  AWS_S3_REGION: z.string().min(1, "AWS_S3_REGION is required"),

  WEBHOOK_SECRET: z.string().min(1, "WEBHOOK_SECRET is required"),
  FRONTEND_URL: z.string().min(1, "FRONTEND_URL is required"),

  DEACTIVATE_USER_CRON_EXP: z
    .string()
    .min(1, "DEACTIVATE_USER_CRON_EXP is required"),

  JWT_REFRESH_TOKEN_EXPIRE: z
    .string()
    .min(1, "JWT_REFRESH_TOKEN_EXPIRE is required"),
  JWT_ACCESS_TOKEN_EXPIRE: z
    .string()
    .min(1, "JWT_ACCESS_TOKEN_EXPIRE is required"),
  REFRESH_TOKEN_MAX_AGE: z.string().min(1, "REFRESH_TOKEN_MAX_AGE is required"),

  GOOGLE_GEOCODING_API_KEY: z
    .string()
    .min(1, "GOOGLE_GEOCODING_API_KEY is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  PINECONE_API_KEY: z.string().min(1, "PINECONE_API_KEY is required"),
  PINECONE_ENV: z.string().min(1, "PINECONE_ENV is required"),
  PINECONE_INDEX: z.string().min(1, "PINECONE_INDEX is required"),

  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, "PINECONE_ENV is required"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "PINECONE_INDEX is required"),

  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().min(1, "REDIS_PORT is required"),

  RAZORPAY_TEST_API_KEY: z.string().min(1, "RAZORPAY_TEST_API_KEY is required"),
  RAZORPAY_TEST_SECRET_KEY: z
    .string()
    .min(1, "RAZORPAY_TEST_SECRET_KEY is required"),

  S3_EXPIRE_TIMIE: z.string().min(1, "S3_EXPIRE_TIMIE is required"),

  CANCEL_INITIALISED_ORDERS_CRON_EXP: z
    .string()
    .min(1, "CANCEL_INITIALISED_ORDERS_CRON_EXP is required"),
});

export const env = envSchema.parse(process.env);
