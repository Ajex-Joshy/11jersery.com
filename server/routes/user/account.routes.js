import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import { getUserAccountController } from "../../controllers/user/account.controller.js";

const router = express.Router();

router.use(authenticateUser);
router.get("/:userId", getUserAccountController);

export default router;
