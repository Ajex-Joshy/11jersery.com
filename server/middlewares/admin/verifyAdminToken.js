import jwt from "jsonwebtoken";
import { AppError } from "../../utils/appError.js";
import { config } from "dotenv";
import Admin from "../../models/adminModel.js";
config();

export const verifyAdminToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication token is missing or invalid."
      )
    );
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminId = decoded.id;
    if (!adminId)
      return next(new AppError(401, "UNAUTHORIZED", "Invalid token payload."));
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return next(new AppError(401, "UNAUTHORIZED", "Admin not found"));
    }
    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
};
