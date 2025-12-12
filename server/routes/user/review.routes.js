import express from "express";
import {
  createReviewController,
  deleteReviewController,
  getReviewsByProductController,
} from "../../controllers/user/review.controller.js";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";

const router = express.Router();

router.post("/", authenticateUser, createReviewController);

router.delete("/:reviewId", authenticateUser, deleteReviewController);

router.get("/:productId", getReviewsByProductController);

export default router;
