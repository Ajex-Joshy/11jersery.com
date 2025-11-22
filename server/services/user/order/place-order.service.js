import Order from "../../../models/order.model.js";
import mongoose from "mongoose";
import { reduceStock, validateStock } from "./stock.service.js";
import Product from "../../../models/product.model.js";
import Transaction from "../../../models/transaction.model.js";
import { sendOrderConfirmationEmail } from "./sendOrderConfirmationEmail.js";

const calculateOrderPrice = async (items) => {
  for (const item of items) {
    await validateStock(item.productId, item.size, item.quantity);
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map();
  products.forEach((product) => {
    productMap.set(product._id.toString(), product);
  });

  let subtotal = 0;
  let discountedPrice = 0;

  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    item.listPrice = product.price.list;
    item.salePrice = product.price.sale;
    item.title = product.title;
    item.slug = product.slug;
    item.imageId = product.imageIds[0];

    subtotal += product.price.list * item.quantity;
    discountedPrice += product.price.sale * item.quantity;
  }

  const deliveryFee = discountedPrice < 500 ? 80 : 0;
  const total = discountedPrice + deliveryFee;

  return { items, subtotal, discountedPrice, deliveryFee, total };
};

export const generateOrderTimeline = () => {
  const now = new Date();
  return {
    placedAt: now,
    confirmedAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    shippedAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    deliveredAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
  };
};

export const placeCodOrder = async (userId, items, shippingAddress) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items: updatedItems,
      subtotal,
      discountedPrice,
      deliveryFee,
      total,
    } = await calculateOrderPrice(items);

    for (const item of updatedItems) {
      await reduceStock(session, item.productId, item.size, item.quantity);
    }

    const order = await Order.create(
      [
        {
          userId,
          items: updatedItems,
          shippingAddress,
          payment: {
            method: "COD",
          },
          status: "pending",
          price: {
            subtotal,
            discountedPrice,
            couponCode: null,
            couponId: null,
            deliveryFee,
            total,
          },
          timeline: generateOrderTimeline(),
        },
      ],
      { session }
    );
    const transaction = await Transaction.create(
      [
        {
          userId,
          orderId: order[0]._id,
          amount: {
            subtotal,
            discountedPrice,
            deliveryFee,
            total,
          },
          type: "CREDIT",
          reason: "ORDER_PAYMENT",
          status: "PENDING",
          paymentMethod: "COD",
        },
      ],
      { session }
    );

    order[0].transactionIds = [transaction[0]._id];
    await order[0].save({ session });
    await session.commitTransaction();
    sendOrderConfirmationEmail(order[0]);
    session.endSession();
    return order[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
