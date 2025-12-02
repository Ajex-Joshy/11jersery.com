import logger from "../../../config/logger.js";
import redisClient from "../../../config/redis-client.js";
import jwt from "jsonwebtoken";
import User from "../../../models/user.model.js";
import { generateTokens, verifyToken } from "../../../utils/jwt.js";
import { AppError } from "../../../utils/helpers.js";
import { STATUS_CODES } from "../../../utils/constants.js";

export const refreshAcessToken = async (token) => {
  if (!token)
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ message: "Unauthorized" });

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "User does not exist.");

  if (user.refreshToken !== token) {
    throw new AppError(
      STATUS_CODES.FORBIDDEN,
      "INVALID_REFRESH_TOKEN",
      "Token does not match user session."
    );
  }

  try {
    const { accessToken, refreshToken } = generateTokens({ user });
    user.refreshToken = refreshToken;
    await user.save();
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

export const blacklistToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - currentTime;

    if (expiresIn > 0) {
      await redisClient.set(`blacklist:${token}`, "true", "EX", expiresIn);
    }
  } catch (err) {
    throw err;
  }
};

export const isTokenBlackListed = async (token) => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result === "true";
  } catch (err) {
    logger.error("Error checking token blacklist:", err);
    return false;
  }
};
