import { STATUS_CODES } from "../../../../utils/constants.js";
import { AppError } from "../../../../utils/helpers.js";
import { debitWallet } from "../../wallet.services.js";
import { getCartData } from "../utils/get-cart-data.js";
import { withTransaction } from "../utils/withTransaction.js";
import { finalizeOrderCreation } from "./create-final-order.js";
import { postProcessOrder } from "./utils/post-process-order.service.js";

export const placeWalletOrder = async (userId, shippingAddressId) =>
  withTransaction(async (session) => {
    const { processedItems, priceData } = await getCartData(userId);

    const { orderDetails, items } = await finalizeOrderCreation(session, {
      userId,
      items: processedItems,
      shippingAddressId,
      paymentMethod: "WALLET",
      priceData,
      transactionStatus: "SUCCESS",
    });

    const walletTransaction = await debitWallet(
      session,
      userId,
      priceData.total,
      "Order Payment",
      orderDetails.orderId
    );

    if (!walletTransaction) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "PAYMENT_FAILED",
        "Wallet debit failed"
      );
    }
    await postProcessOrder(userId, orderDetails, priceData, items);
    return orderDetails;
  });
