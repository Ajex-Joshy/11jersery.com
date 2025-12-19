import User from "../../../models/user.model.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../../../utils/jwt.js";
import { AppError } from "../../../utils/helpers.js";
// import logger from "../../../config/logger.js";
// import admin from "../../../config/firebaseAdmin.js";
import { STATUS_CODES } from "../../../utils/constants.js";
import { nanoid } from "nanoid";
import { blacklistToken } from "./token.service.js";

export const signupUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    // firebaseToken,
    referralCode,
  } = userData;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser)
    throw new AppError(
      STATUS_CODES.CONFLICT,
      "EMAIL_ALREADY_EXISTS",
      "User already exists."
    );

  // Firebase verification
  // await verifyFirebaseToken(firebaseToken, phone);

  // Handle referral
  const referrer = await handleReferral(email, referralCode);

  // Hash password and save user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    referralCode: nanoid(8),
    referrerId: referrer?._id,
    referralBonus: 1,
  });

  await newUser.save();
  const user = await User.findById(newUser._id)
    .select("_id firstName lastName email phone imageId")
    .lean();

  if (referrer) {
    referrer.referralBonus += 1;
    referrer.referredUsers.push(newUser._id);
    await referrer.save();
  }

  const { accessToken, refreshToken } = generateTokens({ user });
  newUser.refreshToken = refreshToken;
  await newUser.save();

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  }).select("_id firstName lastName email password phone imageId");

  if (!user)
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
      "Invalid email/phone or password"
    );

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    throw new AppError(
      STATUS_CODES.UNAUTHORIZED,
      "INVALID_CREDENTIALS",
      "Invalid email/phone or password"
    );

  const { accessToken, refreshToken } = generateTokens({ user });
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  return { user: userObj, accessToken, refreshToken };
};

export const logoutUser = async (userId, accessToken) => {
  if (!userId)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "MISSING_USER_ID",
      "User ID is required to logout."
    );

  const user = await User.findById(userId);
  if (!user)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "USER_NOT_FOUND",
      "User does not exist."
    );

  if (accessToken) await blacklistToken(accessToken);

  user.refreshToken = null;
  await user.save();

  return { message: "User successfully logged out." };
};

// /** Helpers for modularity **/
// const verifyFirebaseToken = async (firebaseToken, phone) => {
//   try {
//     const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
//     if (decodedToken.phone_number !== phone)
//       throw new Error("Phone number mismatch");
//     return decodedToken;
//   } catch (error) {
//     logger.error(error);
//     throw new AppError(
//       STATUS_CODES.BAD_REQUEST,
//       "INVALID_TOKEN",
//       "Invalid or expired Firebase token."
//     );
//   }
// };

const handleReferral = async (email, referralCode) => {
  if (!referralCode) return null;
  const referrer = await User.findOne({
    referralCode,
    isDeleted: false,
    isBlocked: false,
  });
  if (!referrer)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_REFERRAL",
      "Referral code invalid."
    );
  if (referrer.email === email)
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "SELF_REFERRAL",
      "Cannot use your own referral code."
    );
  return referrer;
};
