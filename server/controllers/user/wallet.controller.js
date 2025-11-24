import { getUserWalletData } from "../../services/user/wallet.services.js";
import { asyncHandler, sendResponse } from "../../utils/helpers.js";

export const getWalletController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const queryParams = req.query;

  const walletData = await getUserWalletData(userId, queryParams);

  sendResponse(res, walletData);
});
