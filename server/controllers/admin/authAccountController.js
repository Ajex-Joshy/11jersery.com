import { loginAdmin } from "../../services/admin/authAccountServices.js";
import { asyncHandler } from "../../utils/helpers.js";

export const adminLoginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginAdmin(email, password);
  res.status(200).json(result);
});

export const adminLogoutController = (req, res) => {
  res.send(req.admin);
};
