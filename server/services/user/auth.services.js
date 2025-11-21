import User from "../../models/user.model.js";
import bcrypt from "bcrypt";
import { generateTokens, verifyToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/helpers.js";
import crypto from "crypto";
import logger from "../../config/logger.js";
import { sendEmail } from "../../utils/email-service.js";
import { config } from "dotenv";
config();
import admin from "../../config/firebaseAdmin.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const signupUser = async (userData) => {
  const { firstName, lastName, email, phone, password, firebaseToken } =
    userData;
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (existingUser) {
    throw new AppError(
      STATUS_CODES.CONFLICT,
      "EMAIL_ALREADY_EXISTS",
      "A user with this email or phone address already exists."
    );
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(firebaseToken);
  } catch (error) {
    logger.error(error);
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_TOKEN",
      "Invalid or expired Firebase token. Please try again."
    );
  }
  if (decodedToken.phone_number !== phone) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "VALIDATION_ERROR",
      "Phone number does not match the verification token."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
  });

  await newUser.save();
  const user = await User.findById(newUser._id)
    .select("_id firstName lastName email phone imageId")
    .lean();
  const { refreshToken, accessToken } = generateTokens({ user });

  newUser.refreshToken = refreshToken;
  await newUser.save();

  delete user.password;
  delete user.refreshToken;
  delete user.lastLogin;
  delete user.updatedAt;

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  }).select(" _id firstName lastName email imageId password phone");
  if (!user) {
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
      "Invalid email/phone or password"
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
      "Invalid email/phone or password"
    );
  }

  const { accessToken, refreshToken } = generateTokens({ user });
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.lastLogin;
  delete userObj.updatedAt;
  return { user: userObj, accessToken, refreshToken };
};

export const refreshAcessToken = async (token) => {
  if (!token)
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ message: "Unauthorized" });

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).lean();
    const { accessToken, refreshToken } = generateTokens({ user });
    return { accessToken, refreshToken };
  } catch (err) {
    logger.error(err);
    throw new AppError(
      STATUS_CODES.FORBIDDEN,
      "INVALID_REFRESH_TOKEN",
      "Invalid refresh token"
    );
  }
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // 1. Security: Always return a success message, even if user not found.
  // This prevents "user enumeration" attacks.
  if (!user) {
    return {
      message:
        "If an account with this email exists, a password reset link has been sent.",
    };
  }

  // 2. Generate a unique, random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 3. Set token and 1-hour expiry on the user document
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

  await user.save();

  // 4. Create the reset URL for the frontend
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // 5. Send the email (this is abstracted)
  const emailBody = `
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
    <a href="${resetUrl}" target="_blank">Reset your password</a>
    <p>This link is valid for 1 hour.</p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: "11jersey.com - Password Reset",
      html: emailBody,
    });
  } catch (error) {
    logger.error("Email sending failed:", error);
    // Don't fail the request, but clear the token so they can try again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw new AppError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "INTERNAL_SERVER_ERROR",
      "Failed to send password reset email. Please try again later."
    );
  }

  return {
    message:
      "If an account with this email exists, a password reset link has been sent.",
  };
};

// export const requestOTP = async (email) => {
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email");
//   }

//   const { otp, otpHash } = await generateHashedOTP();
//   await saveOTP(user._id, email, otpHash);
//   await sendOTPEmail(email, otp);
//   return { message: "OTP sent successfully" };
// };

// export const verifyOtp = async (identifier, otp) => {
//   const otpRecord = await Otp.findOne({ identifier });
//   if (!otpRecord) throw new AppError(404, "OTP_NOT_FOUND", "OTP not found");
//   if (otpRecord.expiresAt < new Date())
//     throw new AppError(400, "OTP_EXPIRED", "OTP expired");
//   const isOtpCorrect = await bcrypt.compare(otp, otpRecord.otpHash);
//   if (!isOtpCorrect) throw new AppError(401, "INVALID_OTP", "OTP invalid");

//   await Otp.deleteOne({ _id: otpRecord._id });
//   const resetToken = generateToken({ id: otpRecord.userId }, "15m");

//   return { message: "OTP verified successfully.", resetToken };
// };

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "UNAUTHORIZED",
      "Password reset token is invalid or has expired."
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return { data: { user: userObj } };
};
