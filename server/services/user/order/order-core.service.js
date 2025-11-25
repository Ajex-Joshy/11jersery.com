import Order from "../../../models/order.model.js";
import Transaction from "../../../models/order-transaction.model.js";
import { reduceStock } from "./stock.service.js";
import { sendOrderConfirmationEmail } from "./sendOrderConfirmationEmail.js";
import Address from "../../../models/address.model.js";
import { clearCart } from "../cart.services.js";
import { MAX_QUANTITY_PER_ORDER } from "../../../utils/constants.js";

export const generateOrderTimeline = () => {
  const now = new Date();
  return {
    placedAt: now,
    confirmedAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    shippedAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
  };
};

export const finalizeOrderCreation = async (
  session,
  {
    userId,
    items,
    shippingAddressId,
    paymentMethod,
    priceData,
    transactionStatus = "PENDING",
  }
) => {
  for (const item of items) {
    if (item.quantity > MAX_QUANTITY_PER_ORDER) {
      throw new Error(`Maximum quantity per item is ${MAX_QUANTITY_PER_ORDER}`);
    }
    await reduceStock(session, item.productId, item.size, item.quantity);
  }
  const [shippingAddress] = await Address.find({
    _id: shippingAddressId,
    userId,
    isDeleted: false,
  }).select("-createdAt -updatedAt -__v");
  if (!shippingAddress)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "NOT_FOUND",
      "Address not found"
    );
  const [order] = await Order.create(
    [
      {
        userId,
        items,
        shippingAddress,
        payment: { method: paymentMethod },
        status: paymentMethod === "COD" ? "pending" : "confirmed",
        price: priceData,
        timeline: generateOrderTimeline(),
      },
    ],
    { session }
  );

  const [transaction] = await Transaction.create(
    [
      {
        userId,
        orderId: order._id,
        amount: priceData,
        type: "CREDIT",
        reason: "ORDER_PAYMENT",
        status: transactionStatus,
        paymentMethod,
      },
    ],
    { session }
  );

  // 4. Link Transaction to Order
  order.transactionIds.push(transaction._id);
  const orderDetails = await order.save({ session });
  sendOrderConfirmationEmail(orderDetails);
  clearCart(userId);

  return order;
};
