import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import Otp from "../models/OTPModel.js";

export const generateHashedOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  return { otp, otpHash };
};

export const saveOTP = async (
  userId,
  identifier,
  otpHash,
  type = "password-reset"
) => {
  const now = Date.now();
  return await Otp.findOneAndUpdate(
    { identifier },
    {
      $set: {
        userId,
        otpHash,
        identifier,
        type,
        expiresAt: now + 10 * 60 * 1000,
        createdAt: now,
      },
    },
    { upsert: true, new: true }
  );
};

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 4,
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many OTP verification attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
