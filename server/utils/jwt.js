import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (payload, expiry) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiry });
};

export const generateTokens = (userObject) => {
  const accessToken = generateToken(userObject, env.JWT_ACCESS_TOKEN_EXPIRE);
  const refreshToken = generateToken(
    { id: userObject.user._id },
    env.JWT_REFRESH_TOKEN_EXPIRE
  );
  return { accessToken, refreshToken };
};

export const setRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: Number(env.REFRESH_TOKEN_MAX_AGE),
    path: "/",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
