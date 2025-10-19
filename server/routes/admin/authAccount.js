import express from "express";
import { validateLoginData } from "../../middlewares/common/validateLoginData.js";
import { adminLoginController } from "../../controllers/admin/authAccountController.js";

const router = express.Router();

router.post("/login", validateLoginData, adminLoginController);

export default router;
