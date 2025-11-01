import { loginAdmin } from "../../services/admin/auth-account.services.js";
import { STATUS_CODES } from "../../utils/constants.js";
import { asyncHandler } from "../../utils/helpers.js";

export const adminLoginController = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await loginAdmin(identifier, password);
  res.status(STATUS_CODES.OK).json(result);
});

export const adminLogoutController = (req, res) => {
  res.send(req.admin);
};
