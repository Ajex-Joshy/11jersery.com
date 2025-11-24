import redisClient from "../../config/redis-client.js";
import User from "../../models/user.model.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { sendEmail } from "../../utils/email-service.js";
import { verifyEmailChangeTemplate } from "../../utils/email-templates/verify-email-change-otp.js";
import { AppError } from "../../utils/helpers.js";
import bcrypt from "bcrypt";

export const getAccountDetails = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    isBlocked: false,
    isDeleted: false,
  }).select(" _id firstName lastName email phone ");
  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "could not found user"
    );
  return user;
};

export const updatePersonalDetails = async (userId, updates) => {
  const allowedFields = ["firstName", "lastName", "email"];

  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key))
  );

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, isBlocked: false, isDeleted: false },
    { $set: filteredUpdates },
    { new: true }
  ).select("_id firstName lastName email phone ");

  if (!updatedUser)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_UPDATE_FAILED",
      "Unable to update user details"
    );

  return updatedUser;
};

export const requestEmailChange = async (userId, newEmail) => {
  const existing = await User.findOne({ email: newEmail });
  if (existing)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "EMAIL_EXISTS",
      "Email is already in use"
    );

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "cannot find user");

  await redisClient.set(
    `emailChange:${userId}`,
    JSON.stringify({ otp, newEmail }),
    "EX",
    600
  );

  await user.save();

  await sendEmail({
    to: newEmail,
    subject: "Verify Your New Email",
    html: verifyEmailChangeTemplate(otp),
  });

  return { message: "OTP sent to new email" };
};

export const confirmEmailChange = async (userId, details) => {
  const data = await redisClient.get(`emailChange:${userId}`);

  if (!data) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "OTP_EXPIRED",
      "OTP expired or not found"
    );
  }

  const { otp, newEmail } = JSON.parse(data);

  if (otp !== details.otp) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "OTP_INVALID",
      "Incorrect OTP"
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { email: newEmail },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found while updating email"
    );
  }

  await redisClient.del(`emailChange:${userId}`);

  return {
    message: "Email updated successfully",
    email: updatedUser.email,
  };
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  // Fetch user with password
  const user = await User.findOne({
    _id: userId,
    isBlocked: false,
    isDeleted: false,
  }).select("+password");

  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User not found"
    );

  // Compare old
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INCORRECT_PASSWORD",
      "Current password is incorrect"
    );

  // Check if new password is the same as old password
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "SAME_PASSWORD",
      "New password cannot be the same as old password"
    );

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  user.password = hashedPassword;
  await user.save();

  return { message: "Password updated successfully" };
};
