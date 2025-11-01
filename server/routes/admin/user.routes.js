import express from "express";
import {
  getUsersController,
  getUsersStatsController,
  userStatusController,
} from "../../controllers/admin/user.controller.js";
import { verifyAdminToken } from "../../middlewares/admin/verify-admin-token.js";

const router = express.Router();

router.get("/", verifyAdminToken, getUsersController);
router.get("/stats", verifyAdminToken, getUsersStatsController);
router.patch("/:userId/status", verifyAdminToken, userStatusController);

export default router;
