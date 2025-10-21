import express from "express";
import authRoutes from "./authRoutes.js";
import { getLandingPageController } from "../../controllers/user/landingPageController.js";
import productRoutes from "./productRoutes.js";

const userRouter = express.Router();
userRouter.get("/home", getLandingPageController);
userRouter.use("/auth", authRoutes);
userRouter.use("/product", productRoutes);

export default userRouter;
