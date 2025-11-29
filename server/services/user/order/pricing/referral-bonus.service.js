import User from "../../../../models/user.model.js";
import { STATUS_CODES } from "../../../../utils/constants.js";
import { AppError } from "../../../../utils/helpers.js";

export const checkReferralBonus = async (userId) => {
  const user = await User.findById(userId);

  if (!user)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "User not found");

  if (user.referralBonus > 0) {
    return true;
  }

  return false;
};
export const applyReferralBonus = async (userId, amount) => {
  const user = await User.findById(userId);

  if (!user)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "User not found");

  if (user.referralBonus < 1) {
    return false;
  }
  user.referralRewards.amount += amount;
  user.referralRewards.count += 1;

  user.referralBonus -= 1;

  await user.save();
  return true;
};
