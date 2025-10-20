import express from "express";
import authRoutes from "./authAccount.js";
import userRoutes from "./userRoutes.js";

const adminRouter = express.Router();

adminRouter.use("/auth", authRoutes);
adminRouter.use("/users", userRoutes);

export default adminRouter;
