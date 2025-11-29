import { debitWallet } from "../../wallet.services.js";
import { getCartData } from "../utils/get-cart-data.js";
import { withTransaction } from "../utils/withTransaction.js";
import { finalizeOrderCreation } from "./create-final-order.js";
import { postProcessOrder } from "./utils/post-process-order.service.js";

export const placeWalletOrder = async (userId, shippingAddressId) =>
  withTransaction(async (session) => {
    const { processedItems, priceData } = await getCartData(userId);

    await debitWallet(session, userId, priceData.total, null, "Order Payment");

    const { orderDetails, items } = await finalizeOrderCreation(session, {
      userId,
      items: processedItems,
      shippingAddressId,
      paymentMethod: "WALLET",
      priceData,
      transactionStatus: "SUCCESS",
    });
    await postProcessOrder(userId, orderDetails, priceData, items);
    return orderDetails;
  });
