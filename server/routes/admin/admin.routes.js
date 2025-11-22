import express from "express";
import authRoutes from "./auth-account.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import { verifyAdminToken } from "../../middlewares/admin/verify-admin-token.js";
import orderRoutes from "./order.routes.js";

const adminRouter = express.Router();

adminRouter.use("/auth", authRoutes);
adminRouter.use("/users", verifyAdminToken, userRoutes);
adminRouter.use("/categories", verifyAdminToken, categoryRoutes);
adminRouter.use("/products", verifyAdminToken, productRoutes);
adminRouter.use("/orders", verifyAdminToken, orderRoutes);

export default adminRouter;
