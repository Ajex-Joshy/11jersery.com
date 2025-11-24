import express from "express";
import {
  cancelOrderController,
  cancelOrderItemController,
  getOrderDetailsController,
  getOrdersController,
  getReturnRequestsController,
  processItemReturnController,
  processOrderReturnController,
  updateOrderStatusController,
} from "../../controllers/admin/order.controller.js";

const router = express.Router();

router.get("/", getOrdersController);

router.get("/returns", getReturnRequestsController);

router.get("/:orderId", getOrderDetailsController);

router.patch("/:orderId/status", updateOrderStatusController);

router.patch("/:orderId/cancel", cancelOrderController);

router.patch("/:orderId/items/:itemId/cancel", cancelOrderItemController);

router.patch(
  "/:orderId/items/:itemId/return/:action",
  processItemReturnController
);

router.patch("/:orderId/return/:action", processOrderReturnController);

export default router;
