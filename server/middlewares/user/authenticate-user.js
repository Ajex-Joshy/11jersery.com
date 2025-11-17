import { verifyToken } from "../../utils/jwt.js";
import User from "../../models/user.model.js";
import { AppError } from "../../utils/helpers.js";
import logger from "../../config/logger.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        STATUS_CODES.UNAUTHORIZED,
        "UNAUTHORIZED",
        "Authentication token is missing or invalid."
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      logger.error(err.message);
      throw new AppError(
        STATUS_CODES.UNAUTHORIZED,
        "INVALID_TOKEN",
        "Token invalid or expired"
      );
    }
    if (!decoded.id)
      throw new AppError(
        STATUS_CODES.UNAUTHORIZED,
        "INVALID_TOKEN",
        "Token invalid or expired"
      );

    const user = await User.findById(decoded.id);
    if (!user)
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "USER_NOT_FOUND",
        "User does not exist"
      );

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
