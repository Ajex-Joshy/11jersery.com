import express from "express";
import authRoutes from "./authRoutes.js";
import { getLandingPageController } from "../../controllers/user/landingPageController.js";
import productRoutes from "./productRoutes.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import checkUserStatus from "../../middlewares/user/checkUserStatus.js";

const userRouter = express.Router();
userRouter.get("/orders", ClerkExpressRequireAuth(), checkUserStatus);
userRouter.get("/landing-page", getLandingPageController);
userRouter.use("/auth", authRoutes);
userRouter.use("/product", productRoutes);

export default userRouter;
