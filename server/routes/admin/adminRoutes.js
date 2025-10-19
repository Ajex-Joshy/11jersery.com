import express from "express";
import authRoutes from "./authAccount.js";

const adminRouter = express.Router();

adminRouter.use("/auth", authRoutes);

export default adminRouter;
