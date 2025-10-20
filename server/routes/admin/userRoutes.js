import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import { getUsersController } from "../../controllers/admin/userController.js";

const router = express.Router();

router.get("/", verifyAdminToken, getUsersController);

export default router;
