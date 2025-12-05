import cron from "node-cron";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { restoreAllStock } from "../services/user/order/helper-services/stock.service.js";
import { env } from "../config/env.js";
import logger from "../config/logger.js";
import updateCouponUsage from "../services/user/order/place-order-services/utils/coupon-action.js";

cron.schedule(env.CANCEL_INITIALISED_ORDERS_CRON_EXP, async () => {
  logger.info(" Cron: Checking for expired Initialized orders...");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredOrders = await Order.find({
      orderStatus: "Initialized",
      createdAt: { $lte: tenMinutesAgo },
    }).session(session);

    if (!expiredOrders.length) {
      logger.info("✔ No expired Initialized orders found.");
      await session.commitTransaction();
      session.endSession();
      return;
    }

    logger.info(` Expired orders found: ${expiredOrders.length}`);

    for (const order of expiredOrders) {
      // restore stock
      await restoreAllStock(session, order.items);

      // update status to Cancelled
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            orderStatus: "Cancelled",
            "payment.status": "Failed",
            "timeline.cancelledAt": new Date(),
          },
        }
      ).session(session);
      if (order.price.couponDiscount > 0) {
        await updateCouponUsage(order.price.couponCode, -1);
      }

      logger.info(`🛑 Order Cancelled & Stock Restored: ${order._id}`);
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    logger.error(" Cron job failed:", error);
    await session.abortTransaction();
    session.endSession();
  }
});
