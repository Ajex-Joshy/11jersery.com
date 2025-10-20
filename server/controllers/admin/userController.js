import { getUsers } from "../../services/admin/userServices.js";
import { asyncHandler, sendResponse } from "../../utils/helpers.js";

export const getUsersController = asyncHandler(async (req, res) => {
  const result = await getUsers(req.query);
  sendResponse(res, result);
});
