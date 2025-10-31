import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/helpers.js";
import crypto from "crypto";
import logger from "../../utils/logger.js";
import { sendEmail } from "../../utils/emailService.js";
import { config } from "dotenv";
config();
import admin from "../../config/firebaseAdmin.js";

export const signupUser = async (userData) => {
  const { firstName, lastName, email, phone, password, firebaseToken } =
    userData;
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });
  if (existingUser) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "A user with this email or phone address already exists."
    );
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(firebaseToken);
  } catch (error) {
    throw new AppError(
      401,
      "INVALID_TOKEN",
      "Invalid or expired Firebase token. Please try again."
    );
  }
  if (decodedToken.phone_number !== phone) {
    throw new AppError(
      400,
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

  const userObj = newUser.toObject();
  delete userObj.password;

  const token = generateToken({ id: newUser._id });

  return { user: userObj, token };
};

export const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
  if (!user) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email/phone or password"
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email/phone or password"
    );
  }
  const token = generateToken({ id: user._id });
  user.lastLogin = new Date();
  await user.save();
  const userObj = user.toObject();
  delete userObj.password;
  return { user: userObj, token };
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
      500,
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
  console.log(token, newPassword);
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError(
      401,
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
