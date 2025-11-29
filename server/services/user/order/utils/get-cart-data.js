import Cart from "../../../../models/cart.model.js";
import { calculateOrderPrice } from "../pricing/pricing.service.js";
import { processCartItems } from "./processCartItems.js";

export const getCartData = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || !cart.items?.length) throw new Error("Cart is empty");
  const priceData = await calculateOrderPrice(cart);
  const processedItems = await processCartItems(cart);
  return { cart, priceData, processedItems };
};
