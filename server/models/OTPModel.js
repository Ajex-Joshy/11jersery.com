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

    otpHash: {
      type: String,
      required: true,
      select: false,
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

const OTPModel = mongoose.model("OTP", OTPSchema);
export default OTPModel;
