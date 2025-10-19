import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const generateToken = (payload, expiry = "1d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
