import { asyncHandler } from "../../utils/helpers.js";
import { getDashboardStats } from "../../services/admin/dashboard.service.js";
import { sendResponse } from "../../utils/helpers.js";

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();

  sendResponse(res, {
    message: "Dashboard stats fetched successfully",
    payload: stats,
  });
});
