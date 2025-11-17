import logger from "../../config/logger.js";
import User from "../../models/user.model.js";
import { STATUS_CODES } from "../../utils/constants.js";

const checkUserStatus = async (req, res, next) => {
  try {
    // 'req.auth.userId' is added by Clerk's middleware
    const authId = req.auth.userId;

    if (!authId) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ error: "Not authenticated" });
    }

    const user = await User.findById(authId);

    if (!user) {
      // This could happen if the webhook is slow.
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: "User not found in our system" });
    }

    if (user.isBlocked) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ error: "This account is blocked." });
    }

    User.updateOne({ _id: authId }, { $set: { lastLogin: new Date() } }).exec();

    req.user = user;
    next();
  } catch (err) {
    logger.error(err);
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};

export default checkUserStatus;
