import express from "express";
import {
  getSalesReportController,
  downloadReportController,
} from "../../controllers/admin/report.controller.js";
import { verifyAdminToken } from "../../middlewares/admin/verify-admin-token.js";

const router = express.Router();

router.get("/", verifyAdminToken, getSalesReportController);
router.get("/download", verifyAdminToken, downloadReportController);

export default router;
