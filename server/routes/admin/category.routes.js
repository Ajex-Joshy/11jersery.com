import express from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriescontroller,
  getCategoryBySlugController,
  updateCategoryController,
  updateCategoryStatusController,
} from "../../controllers/admin/category.controller.js";
import { verifyAdminToken } from "../../middlewares/admin/verify-admin-token.js";
import { validate } from "../../middlewares/common/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/admin/category-validator.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/:slug", verifyAdminToken, getCategoryBySlugController);
router.get("/", verifyAdminToken, getCategoriescontroller);

router.post(
  "/",
  upload.single("image"),
  validate(createCategorySchema),
  createCategoryController
);
router.patch(
  "/:categoryId",
  upload.single("image"),
  validate(updateCategorySchema),

  updateCategoryController
);
router.patch("/:categoryId/status", updateCategoryStatusController);
router.delete("/:categoryId", deleteCategoryController);

export default router;
