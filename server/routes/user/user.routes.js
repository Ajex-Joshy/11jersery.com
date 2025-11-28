import express from "express";
import authRoutes from "./auth.routes.js";
import { getLandingPageController } from "../../controllers/user/landing-page.controller.js";
import productRoutes from "./product.routes.js";
import { getProductsController } from "../../controllers/user/product.controller.js";
import cartRoutes from "./cart.routes.js";
import accountRouter from "./account.routes.js";
import addressRouter from "./address.routes.js";
import orderRouter from "./order.routes.js";
import walletRoutes from "./wallet.routes.js";
import couponRoutes from "./coupon.routes.js";
import wishlistRouter from "./wishlist.routes.js";

const userRouter = express.Router();
userRouter.get("/landing-page", getLandingPageController);
userRouter.use("/auth", authRoutes);
userRouter.use("/product", productRoutes);
userRouter.use("/cart", cartRoutes);
userRouter.use("/account", accountRouter);
userRouter.use("/address", addressRouter);
userRouter.use("/orders", orderRouter);
userRouter.use("/wallet", walletRoutes);
userRouter.use("/coupons", couponRoutes);
userRouter.use("/wishlist", wishlistRouter);

userRouter.get("/products", getProductsController);
export default userRouter;
