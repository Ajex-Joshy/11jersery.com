import express from "express";
import {
  createProductController,
  deleteProductController,
  getProductDetailsController,
  getProductsController,
  updateProductController,
  updateProductStatus,
} from "../../controllers/admin/product.controller.js";
import { verifyAdminToken } from "../../middlewares/admin/verify-admin-token.js";

import multer from "multer";
import {
  parsedFaqsDataSchema,
  parsedProductDataSchema,
} from "../../validators/admin/product-validators.js";
import {
  parseAndValidateProductData,
  parseImagesToDelete,
} from "../../middlewares/admin/product-helpers.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/:slug", verifyAdminToken, getProductDetailsController);

router.get("/", verifyAdminToken, getProductsController);

router.post(
  "/",
  verifyAdminToken,
  upload.array("images"),
  parseAndValidateProductData(parsedProductDataSchema, "product"),
  parseAndValidateProductData(parsedFaqsDataSchema, "faqs"),
  createProductController
);

router.patch(
  "/:id",
  verifyAdminToken,
  upload.array("images", 4),
  parseAndValidateProductData(parsedProductDataSchema, "product"), // Use 'update' schema if different
  parseAndValidateProductData(parsedFaqsDataSchema, "faqs"),
  parseImagesToDelete,
  updateProductController
);

router.patch("/:productId/status", verifyAdminToken, updateProductStatus);
router.delete("/:productId", verifyAdminToken, deleteProductController);

export default router;
