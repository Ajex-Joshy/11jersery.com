import express from "express";
import {
  createProductController,
  deleteProductController,
  getProductsController,
  updateProductController,
  updateProductStatus,
} from "../../controllers/admin/productController.js";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";

import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", verifyAdminToken, getProductsController);

router.post(
  "/",
  verifyAdminToken,
  upload.array("images", 4),
  createProductController
);

router.patch("/:productId", verifyAdminToken, updateProductController);

router.patch("/:productId/status", verifyAdminToken, updateProductStatus);
router.delete("/:productId", verifyAdminToken, deleteProductController);

export default router;
