import { verifyToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/appError.js";
import User from "../../models/userModel.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication token is missing or invalid."
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new AppError(401, "INVALID_TOKEN", "Token invalid or expired");
    }
    if (!decoded.id)
      throw new AppError(401, "INVALID_TOKEN", "Token invalid or expired");

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "User does not exist");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
