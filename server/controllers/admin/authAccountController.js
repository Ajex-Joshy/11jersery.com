import { loginAdmin } from "../../services/admin/authAccountServices.js";

export const adminLoginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginAdmin(email, password);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const adminLogoutController = (req, res, next) => {
  res.send(req.admin);
};
