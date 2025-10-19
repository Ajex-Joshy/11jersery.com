import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/appError.js";
import { generateToken } from "../../utils/jwt.js";
import Otp from "../../models/OTPModel.js";
import sendOTPEmail from "../../utils/sendEmailOTP.js";
import { generateHashedOTP, saveOTP } from "../../utils/otpUtils.js";

export const signupUser = async (userData) => {
  const { email } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "A user with this email address already exists."
    );
  }

  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  const newUser = await User.create(userData);
  const token = generateToken({ id: newUser._id });

  const userObj = newUser.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

export const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  }).select("+password");
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

export const requestOTP = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email");
  }

  const { otp, otpHash } = await generateHashedOTP();
  await saveOTP(user._id, email, otpHash);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent successfully" };
};

export const verifyOtp = async (identifier, otp) => {
  const otpRecord = await Otp.findOne({ identifier });
  if (!otpRecord) throw new AppError(404, "OTP_NOT_FOUND", "OTP not found");
  if (otpRecord.expiresAt < new Date())
    throw new AppError(400, "OTP_EXPIRED", "OTP expired");
  const isOtpCorrect = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isOtpCorrect) throw new AppError(401, "INVALID_OTP", "OTP invalid");
  await Otp.deleteOne({ _id: otpRecord._id });
  const resetToken = generateToken({ id: otpRecord.userId }, "15m");
  return { message: "OTP verified successfully.", resetToken };
};
