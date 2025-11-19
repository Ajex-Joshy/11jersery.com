import express from "express";
import {
  getCartController,
  addItemToCartController,
  removeItemFromCartController,
  clearCartController,
  decrementItem,
  incrementItem,
} from "../../controllers/user/cart.controller.js";
import { authenticateUser } from "../../middlewares/user/authenticate-user.js";

const router = express.Router();

router.use(authenticateUser);

router.get("/", getCartController);

router.post("/item", addItemToCartController);

router.patch("/increment/:itemId", incrementItem);

router.patch("/decrement/:itemId", decrementItem);

router.delete("/remove/:itemId", removeItemFromCartController);

router.delete("/clear", clearCartController);

export default router;
