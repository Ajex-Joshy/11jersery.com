import cron from "node-cron";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { restoreAllStock } from "../services/user/order/helper-services/stock.service.js";

// Runs every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  console.log(" Cron: Checking for expired Initialized orders...");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredOrders = await Order.find({
      orderStatus: "Initialized",
      createdAt: { $lte: tenMinutesAgo },
    }).session(session);

    if (!expiredOrders.length) {
      console.log("✔ No expired Initialized orders found.");
      await session.commitTransaction();
      session.endSession();
      return;
    }

    console.log(` Expired orders found: ${expiredOrders.length}`);

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

      console.log(`🛑 Order Cancelled & Stock Restored: ${order._id}`);
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error(" Cron job failed:", error);
    await session.abortTransaction();
    session.endSession();
  }
});
