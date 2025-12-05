import { createRazorpayOrder } from "../../razorpay.service.js";
import { getCartData } from "../utils/get-cart-data.js";
import { withTransaction } from "../utils/withTransaction.js";
import { finalizeOrderCreation } from "./create-final-order.js";

export const initOnlineOrder = async (userId, shippingAddressId) =>
  withTransaction(async (session) => {
    const { processedItems, priceData } = await getCartData(userId);

    const razorpayOrder = await createRazorpayOrder(priceData.total);
    const { id, currency } = razorpayOrder;

    await finalizeOrderCreation(session, {
      userId,
      items: processedItems,
      shippingAddressId,
      paymentMethod: "RAZORPAY",
      priceData,
      razorpayOrderId: id,
    });

    return {
      razorpayOrderId: id,
      amount: priceData.total * 100,
      currency: currency,
    };
  });
