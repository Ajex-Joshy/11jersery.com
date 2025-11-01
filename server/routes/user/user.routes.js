import express from "express";
import authRoutes from "./auth.routes.js";
import { getLandingPageController } from "../../controllers/user/landing-page.controller.js";
import productRoutes from "./product.routes.js";
import checkUserStatus from "../../middlewares/user/check-user-status.js";
import { getProductsController } from "../../controllers/user/product.controller.js";
import cartRoutes from "./cart.routes.js";

const userRouter = express.Router();
userRouter.get("/orders", checkUserStatus);
userRouter.get("/landing-page", getLandingPageController);
userRouter.use("/auth", authRoutes);
userRouter.use("/product", productRoutes);
userRouter.use("/cart", cartRoutes);

userRouter.get("/products", getProductsController);
export default userRouter;
