import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const generateToken = (payload, expiry) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });
};

export const generateTokens = (userObject) => {
  const accessToken = generateToken(
    userObject,
    process.env.JWT_ACCESS_TOKEN_EXPIRE
  );
  const refreshToken = generateToken(
    { id: userObject.user._id },
    process.env.JWT_REFRESH_TOKEN_EXPIRE
  );
  return { accessToken, refreshToken };
};

export const setRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: process.env.REFRESH_TOKEN_MAX_AGE,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
