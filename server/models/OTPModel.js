import mongoose from "mongoose";
import validator from "validator";

const OTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    identifier: {
      type: String, // can be email or phone
      required: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["password-reset", "verification"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("OTP", OTPSchema);
export default Otp;
