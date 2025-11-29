import { getCartData } from "../utils/get-cart-data.js";
import { withTransaction } from "../utils/withTransaction.js";
import { finalizeOrderCreation } from "./create-final-order.js";
import { postProcessOrder } from "./utils/post-process-order.service.js";

export const placeCodOrder = async (userId, shippingAddressId) =>
  withTransaction(async (session) => {
    const { processedItems, priceData } = await getCartData(userId);

    const { orderDetails, items } = await finalizeOrderCreation(session, {
      userId,
      items: processedItems,
      shippingAddressId,
      paymentMethod: "COD",
      priceData,
    });
    await postProcessOrder(userId, orderDetails, priceData, items);
    return orderDetails;
  });
