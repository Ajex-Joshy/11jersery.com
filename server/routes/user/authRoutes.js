import express from "express";
import { validateSignupData } from "../../middlewares/user/validateSigupData.js";
import { userSignupController } from "../../controllers/user/authController.js";

const router = express.Router();

router.post("/signup", validateSignupData, userSignupController);

export default router;
