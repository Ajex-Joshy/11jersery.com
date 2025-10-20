import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import validateCategory from "../../middlewares/admin/validateCategory.js";
import {
  createCategoryController,
  deleteCategoryController,
  updateCategoryController,
  updateCategoryStatusController,
} from "../../controllers/admin/categoryController.js";

const router = express.Router();

router.post("/", verifyAdminToken, validateCategory, createCategoryController);
router.patch(
  "/:categoryId",
  verifyAdminToken,
  validateCategory,
  updateCategoryController
);
router.patch(
  "/:categoryId/status",
  verifyAdminToken,
  updateCategoryStatusController
);
router.delete("/:categoryId", verifyAdminToken, deleteCategoryController);

export default router;
