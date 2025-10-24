import express from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriescontroller,
  updateCategoryController,
  updateCategoryStatusController,
} from "../../controllers/admin/categoryController.js";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import { validate } from "../../middlewares/common/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/admin/categoryValidator.js";

const router = express.Router();

router.get("/", verifyAdminToken, getCategoriescontroller);
router.post(
  "/",
  verifyAdminToken,
  validate(createCategorySchema),
  createCategoryController
);
router.patch(
  "/:categoryId",
  verifyAdminToken,
  validate(updateCategorySchema),
  updateCategoryController
);
router.patch(
  "/:categoryId/status",
  verifyAdminToken,
  updateCategoryStatusController
);
router.delete("/:categoryId", verifyAdminToken, deleteCategoryController);

export default router;
