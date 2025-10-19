import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};
