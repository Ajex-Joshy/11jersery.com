import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import validateCategory from "../../middlewares/admin/validateCategory.js";
import { createCategoryController } from "../../controllers/admin/categoryController.js";

const router = express.Router();

router.post("/", verifyAdminToken, validateCategory, createCategoryController);

export default router;
