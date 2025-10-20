import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import validateProduct from "../../middlewares/admin/validateProduct.js";
import {
  createProductController,
  deleteProductController,
  getProductsController,
  updateProductController,
  updateProductStatus,
} from "../../controllers/admin/productController.js";
import validateCreateProduct from "../../middlewares/admin/validateCreateProduct.js";

const router = express.Router();

router.get("/", verifyAdminToken, getProductsController);
router.post(
  "/",
  verifyAdminToken,
  validateCreateProduct,
  validateProduct,
  createProductController
);
router.patch(
  "/:productId",
  verifyAdminToken,
  validateProduct,
  updateProductController
);

router.patch("/:productId/status", verifyAdminToken, updateProductStatus);
router.delete("/:productId", verifyAdminToken, deleteProductController);

export default router;
