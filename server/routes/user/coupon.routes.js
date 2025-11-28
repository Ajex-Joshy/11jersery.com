import express from "express";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";
import {
  applyCouponController,
  removeCouponController,
} from "../../controllers/user/coupon.controller.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/coupon", applyCouponController);

router.delete("/coupon", removeCouponController);

export default router;
