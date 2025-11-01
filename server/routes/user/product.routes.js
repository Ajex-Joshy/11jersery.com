import express from "express";
import {
  getProductDetailsController,
  getProductFaqsController,
} from "../../controllers/user/product.controller.js";

const router = express.Router();

router.get("/:slug", getProductDetailsController);
router.get("/faqs/:slug", getProductFaqsController);

export default router;
