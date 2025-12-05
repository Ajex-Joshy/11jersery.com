import { verifyRazorpaySignature } from "../../razorpay.service.js";
import { withTransaction } from "../utils/withTransaction.js";
import Order from "../../../../models/order.model.js";
import { AppError } from "../../../../utils/helpers.js";
import { STATUS_CODES } from "../../../../utils/constants.js";
import Transaction from "../../../../models/order-transaction.model.js";
import { postProcessOrder } from "./utils/post-process-order.service.js";

export const verifyAndPlaceOnlineOrder = async ({ userId, paymentDetails }) =>
  withTransaction(async (session) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      paymentDetails;

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!isValid) throw new Error("Invalid Payment Signature");

    const order = await Order.findOne(
      { "payment.razorpayOrderId": razorpayOrderId },
      null,
      { session }
    );

    if (!order) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "ORDER_NOT_FOUND",
        "Could not process order"
      );
    }

    order.orderStatus = "Pending";
    order.payment.status = "Paid";
    order.items = order.items.map((i) => ({
      ...i,
      status: "Pending",
    }));

    const transaction = await Transaction.create(
      [
        {
          userId,
          orderId: order._id,
          amount: order.price,
          type: "CREDIT",
          reason: "ORDER_PAYMENT",
          status: "SUCCESS",
          paymentMethod: "RAZORPAY",
        },
      ],
      { session }
    );

    order.transactionIds.push(transaction[0]._id);

    const updatedOrder = await order.save({ session });
    await postProcessOrder(userId, order, order.price, order.items);

    return updatedOrder;
  });
