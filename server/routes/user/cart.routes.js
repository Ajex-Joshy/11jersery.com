import express from "express";
import {
  getCartController,
  addItemToCartController,
  updateItemQuantityController,
  removeItemFromCartController,
  mergeCartController,
  clearCartController,
} from "../../controllers/user/cart.controller.js";

const router = express.Router();

// --- All cart routes are protected and require a logged-in user ---
// router.use(verifyUserToken);

router.get("/", getCartController);

router.post("/add", addItemToCartController);

router.post("/merge", mergeCartController);

router.delete("/clear", clearCartController);

router.patch("/update/:itemId", updateItemQuantityController);

router.delete("/remove/:itemId", removeItemFromCartController);

export default router;
