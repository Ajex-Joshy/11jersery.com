import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import {
  placeCodOrderController,
  listUserOrdersController,
  getOrderDetailsController,
  cancelItemController,
  cancelOrderController,
  requestOrderReturnController,
  requestItemReturnController,
  placeWalletOrderController,
  initRazorpayOrderController,
  verifyRazorpayOrderController,
  // submitProductReviewController,
} from "../../controllers/user/order.controller.js";
import { generateInvoiceController } from "../../controllers/user/order.controller.js";

const router = express.Router();
router.use(authenticateUser);

router.post("/cod", placeCodOrderController);

router.post("/wallet", placeWalletOrderController);

router.post("/online", initRazorpayOrderController);

router.post("/verify-online-order", verifyRazorpayOrderController);

router.get("/", listUserOrdersController);

router.get("/:orderId", getOrderDetailsController);

router.get("/:orderId/invoice", generateInvoiceController);

router.post("/:orderId/cancel", cancelOrderController);

router.post("/:orderId/items/:itemId/cancel", cancelItemController);

router.post("/:orderId/return", requestOrderReturnController);

router.post("/:orderId/items/:itemId/return", requestItemReturnController);

// router.post("/:orderIds/items/:itemId/review", submitProductReviewController);

export default router;
