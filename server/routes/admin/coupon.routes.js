import express from "express";
import {
  createCouponController,
  getCouponsController,
  updateCouponController,
  deleteCouponController,
} from "../../controllers/admin/coupon.controller.js";
import { verifyAdminToken } from "../../middlewares/admin/verify-admin-token.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../../validators/admin/coupon-validator.js";
import { validate } from "../../middlewares/common/validate.js";

const router = express.Router();

router.use(verifyAdminToken);

router.post("/", validate(createCouponSchema), createCouponController);
router.get("/", getCouponsController);
router.patch(
  "/:couponId",
  validate(updateCouponSchema),
  updateCouponController
);
router.delete("/:couponId", deleteCouponController);

export default router;
