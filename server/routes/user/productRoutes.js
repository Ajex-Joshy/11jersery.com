import express from "express";
import { getProductDetailsController } from "../../controllers/user/productController.js";

const router = express.Router();

router.get("/:slug", getProductDetailsController);

export default router;
