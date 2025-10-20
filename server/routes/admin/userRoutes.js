import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import {
  getUsersController,
  getUsersStatsController,
} from "../../controllers/admin/userController.js";

const router = express.Router();

router.get("/", verifyAdminToken, getUsersController);
router.get("/stats", verifyAdminToken, getUsersStatsController);

export default router;
