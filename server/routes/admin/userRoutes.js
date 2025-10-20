import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import {
  getUsersController,
  getUsersStatsController,
  userStatusController,
} from "../../controllers/admin/userController.js";

const router = express.Router();

router.get("/", verifyAdminToken, getUsersController);
router.get("/stats", verifyAdminToken, getUsersStatsController);
router.patch("/:userId/status", verifyAdminToken, userStatusController);

export default router;
