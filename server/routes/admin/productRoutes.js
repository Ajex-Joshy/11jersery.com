import express from "express";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";
import validateProduct from "../../middlewares/admin/validateProduct.js";
import { createProductController } from "../../controllers/admin/productController.js";

const router = express.Router();

router.post("/", verifyAdminToken, validateProduct, createProductController);

export default router;
