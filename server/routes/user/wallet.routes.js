import express from "express";
import { getWalletController } from "../../controllers/user/wallet.controller.js";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/", getWalletController);

export default router;
