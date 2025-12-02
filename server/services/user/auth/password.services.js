import User from "../../../models/user.model.js";
import crypto from "crypto";
import { AppError } from "../../../utils/helpers.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import { sendEmail } from "../../../utils/email-service.js";
import bcrypt from "bcrypt";
import { forgotPasswordTemplate } from "../../../utils/email-templates/forgot-password.js";

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user)
    return {
      message: "If an account exists, a password reset link has been sent.",
    };

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: forgotPasswordTemplate(resetUrl, user.firstName),
  });

  return {
    message: "If an account exists, a password reset link has been sent.",
  };
};

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "UNAUTHORIZED",
      "Reset token invalid or expired."
    );

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password reset successfully." };
};
