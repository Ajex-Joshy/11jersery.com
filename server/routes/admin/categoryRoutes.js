import express from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriescontroller,
  getCategoryBySlugController,
  updateCategoryController,
  updateCategoryStatusController,
} from "../../controllers/admin/categoryController.js";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import { validate } from "../../middlewares/common/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/admin/categoryValidator.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/:slug", verifyAdminToken, getCategoryBySlugController);
router.get("/", verifyAdminToken, getCategoriescontroller);

router.post(
  "/",
  upload.single("image"),
  verifyAdminToken,
  validate(createCategorySchema),
  createCategoryController
);
router.patch(
  "/:categoryId",
  verifyAdminToken,
  upload.single("image"),
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
