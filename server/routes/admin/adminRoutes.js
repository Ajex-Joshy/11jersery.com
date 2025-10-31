import express from "express";
import authRoutes from "./authAccount.js";
import userRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import { verifyAdminToken } from "../../middlewares/admin/verifyAdminToken.js";

const adminRouter = express.Router();

adminRouter.use("/auth", authRoutes);
adminRouter.use("/users", verifyAdminToken, userRoutes);
adminRouter.use("/categories", verifyAdminToken, categoryRoutes);
adminRouter.use("/products", verifyAdminToken, productRoutes);

export default adminRouter;
