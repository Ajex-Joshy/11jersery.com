import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import validateProduct from "../../middlewares/admin/validateProduct.js";
import {
  createProductController,
  updateProductController,
} from "../../controllers/admin/productController.js";
import validateCreateProduct from "../../middlewares/admin/validateCreateProduct.js";

const router = express.Router();

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

export default router;
