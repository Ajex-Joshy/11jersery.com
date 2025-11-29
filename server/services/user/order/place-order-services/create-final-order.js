import { reduceStock } from "../helper-services/stock.service.js";
import Order from "../../../../models/order.model.js";
import { generateOrderTimeline } from "./utils/generate-order-timeline.js";
import Transaction from "../../../../models/order-transaction.model.js";
import Address from "../../../../models/address.model.js";

export const finalizeOrderCreation = async (
  session,
  {
    userId,
    items,
    shippingAddressId,
    paymentMethod,
    priceData,
    transactionStatus = "PENDING",
    razorpayOrderId,
  }
) => {
  for (const item of items) {
    await reduceStock(session, item.productId, item.size, item.quantity);
  }

  const shippingAddress = await Address.findOne({
    _id: shippingAddressId,
    userId,
    isDeleted: false,
  }).select("-createdAt -updatedAt -__v");

  if (!shippingAddress) throw new Error("Address not found");

  const [order] = await Order.create(
    [
      {
        userId,
        items,
        shippingAddress,
        payment: { method: paymentMethod },
        orderStatus: paymentMethod === "RAZORPAY" ? "Initialized" : "Pending",
        price: priceData,
        timeline: generateOrderTimeline(),
        "payment.razorpayOrderId":
          paymentMethod === "RAZORPAY" ? razorpayOrderId : null,
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

  order.transactionIds.push(transaction._id);
  const orderDetails = await order.save({ session });

  return { orderDetails, priceData, items };
};
