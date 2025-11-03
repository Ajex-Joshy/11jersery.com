import User from "../../models/user.model.js";
import { AppError } from "../../utils/helpers.js";

export const getAccountDetails = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    isBlocked: false,
    isDeleted: false,
  }).select(" _id firstName lastName email phone imageId");
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "could not found user");
  return user;
};
