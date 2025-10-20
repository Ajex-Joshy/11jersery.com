import { getUsers, getUsersStats } from "../../services/admin/userServices.js";
import { asyncHandler, sendResponse } from "../../utils/helpers.js";

export const getUsersController = asyncHandler(async (req, res) => {
  const result = await getUsers(req.query);
  sendResponse(res, result);
});

export const getUsersStatsController = asyncHandler(async (req, res) => {
  const result = await getUsersStats();
  sendResponse(res, result);
});
