import {
  getUsers,
  getUsersStats,
  updateUserStatus,
} from "../../services/admin/userServices.js";
import { asyncHandler, sendResponse } from "../../utils/helpers.js";

export const getUsersController = asyncHandler(async (req, res) => {
  const result = await getUsers(req.query);
  sendResponse(res, result);
});

export const getUsersStatsController = asyncHandler(async (req, res) => {
  const result = await getUsersStats();
  sendResponse(res, result);
});

export const userStatusController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isBlocked } = req.body;
  const user = await updateUserStatus(userId, isBlocked);
  sendResponse(res, user);
});
