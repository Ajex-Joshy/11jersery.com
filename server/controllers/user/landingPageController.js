import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import { getLandingPageData } from "../../services/user/landingPageService.js";

export const getLandingPageController = asyncHandler(async (req, res) => {
  const result = await getLandingPageData();
  sendResponse(res, result);
});
