import express from "express";
import authRoutes from "./authAccount.js";

const adminRoutes = express.Router();

adminRoutes.use("/auth", authRoutes);

export default adminRoutes;
