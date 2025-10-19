import { signupUser } from "../../services/user/authServices.js";
import { sendAuthResponse } from "../../utils/sendAuthResponse.js";
import { loginUser } from "../../services/user/authServices.js";

export const userSignupController = async (req, res, next) => {
  try {
    const { user, token } = await signupUser(req.body);
    sendAuthResponse(res, user, token, 201);
  } catch (err) {
    next(err);
  }
};

export const userLoginController = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    sendAuthResponse(res, user, token, 200);
  } catch (err) {
    next(err);
  }
};
