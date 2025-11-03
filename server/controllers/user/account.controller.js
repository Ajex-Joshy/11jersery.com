import { getAccountDetails } from "../../services/user/account.services.js";
import { sendResponse } from "../../utils/helpers.js";
import { validateObjectId } from "../../utils/product.utils.js";

export const getUserAccountController = async (req, res) => {
  const { userId } = req.params;
  validateObjectId(userId);
  const result = await getAccountDetails(userId);
  sendResponse(res, result);
};
