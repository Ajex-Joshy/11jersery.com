import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import {
  getUserAccountController,
  updatePersonalDetailsController,
  updatePasswordController,
  requestEmailOtpController,
  verifyEmailOtpController,
} from "../../controllers/user/account.controller.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/:userId", getUserAccountController);

router.put("/update-details", updatePersonalDetailsController);

router.put("/update-password", updatePasswordController);

router.post("/request-email-otp", requestEmailOtpController);

router.post("/verify-email-otp", verifyEmailOtpController);

export default router;
