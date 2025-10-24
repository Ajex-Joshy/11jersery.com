import express from "express";
import {
  createProductController,
  deleteProductController,
  getProductsController,
  updateProductController,
  updateProductStatus,
} from "../../controllers/admin/productController.js";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";

import { validate } from "../../middlewares/common/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../../validators/admin/productValidators.js";

const router = express.Router();

router.get("/", verifyAdminToken, getProductsController);

router.post(
  "/",
  verifyAdminToken,
  validate(createProductSchema),
  createProductController
);

router.patch(
  "/:productId",
  verifyAdminToken,
  validate(updateProductSchema),
  updateProductController
);

router.patch("/:productId/status", verifyAdminToken, updateProductStatus);
router.delete("/:productId", verifyAdminToken, deleteProductController);

export default router;
