import express from "express";
import authRoutes from "./authAccount.js";
import userRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";

const adminRouter = express.Router();

adminRouter.use("/auth", authRoutes);
adminRouter.use("/users", userRoutes);
adminRouter.use("/categories", categoryRoutes);

export default adminRouter;
