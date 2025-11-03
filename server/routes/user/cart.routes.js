import express from "express";
import {
  getCartController,
  addItemToCartController,
  updateItemQuantityController,
  removeItemFromCartController,
  mergeCartController,
  clearCartController,
} from "../../controllers/user/cart.controller.js";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/", getCartController);

router.post("/add", addItemToCartController);

router.post("/merge", mergeCartController);

router.delete("/clear", clearCartController);

router.patch("/update/:itemId", updateItemQuantityController);

router.delete("/remove/:itemId", removeItemFromCartController);

export default router;
