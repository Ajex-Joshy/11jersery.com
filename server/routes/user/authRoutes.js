import express from "express";
import { validateSignupData } from "../../middlewares/user/validateSigupData.js";
import {
  userLoginController,
  userSignupController,
} from "../../controllers/user/authController.js";
import { validateUserLoginData } from "../../middlewares/user/validateUserLoginData.js";

const router = express.Router();

router.post("/signup", validateSignupData, userSignupController);
router.post("/login", validateUserLoginData, userLoginController);

export default router;
