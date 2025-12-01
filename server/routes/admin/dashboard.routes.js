import express from "express";
import { getDashboardStatsController } from "../../controllers/admin/dashboard.controller.js";
import { verifyAdminToken } from "../../middlewares/admin/verify-admin-token.js";

const router = express.Router();

router.get("/stats", verifyAdminToken, getDashboardStatsController);

export default router;
