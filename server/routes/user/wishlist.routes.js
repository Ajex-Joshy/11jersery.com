import express from "express";
import {
  getWishlistController,
  toggleWishlistController,
} from "../../controllers/user/wishlist.controller.js";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";

const router = express.Router();

// Protect all routes
router.use(authenticateUser);

router.get("/", getWishlistController);
router.post("/toggle", toggleWishlistController);

export default router;
