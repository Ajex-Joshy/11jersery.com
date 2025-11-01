import express from "express";
import { adminLoginController } from "../../controllers/admin/auth-account.controller.js";
import { validate } from "../../middlewares/common/validate.js";
import { loginSchema } from "../../validators/common/login-schema.js";

const router = express.Router();

router.post("/login", validate(loginSchema), adminLoginController);

export default router;
