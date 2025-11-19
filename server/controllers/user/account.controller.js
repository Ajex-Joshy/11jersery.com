import {
  getAccountDetails,
  updatePersonalDetails,
  updatePassword,
  confirmEmailChange,
  requestEmailChange,
} from "../../services/user/account.services.js";
import { sendResponse } from "../../utils/helpers.js";
import { validateObjectId } from "../../utils/product.utils.js";

export const getUserAccountController = async (req, res) => {
  const { userId } = req.params;
  validateObjectId(userId);
  const result = await getAccountDetails(userId);
  sendResponse(res, result);
};

export const updatePersonalDetailsController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await updatePersonalDetails(userId, req.body);

    sendResponse(res, {
      message: "Personal details updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePasswordController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    const result = await updatePassword(userId, oldPassword, newPassword);

    sendResponse(res, {
      message: "Password updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const requestEmailOtpController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    const result = await requestEmailChange(userId, newEmail);

    sendResponse(res, {
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOtpController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { otp } = req.body;

    const result = await confirmEmailChange(userId, otp);

    sendResponse(res, {
      message: "Email updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
