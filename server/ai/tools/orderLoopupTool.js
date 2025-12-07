import { tool } from "@langchain/core/tools";
import Order from "../../models/order.model.js";
import z from "zod";
import { normalizeOrderId } from "../utils/formatters.js";

export const orderLookupTool = tool(
  async ({ orderId }, config) => {
    const userId = config.configurable?.userId;

    if (!userId) {
      throw new Error("User not authenticated. Cannot fetch orders.");
    }
    const id = normalizeOrderId(orderId);
    if (id) {
      const order = await Order.findOne({ userId, orderId: id });
      if (order) return order;
    }

    const recentOrders = await Order.find({ userId }).sort({ createdAt: -1 });

    return recentOrders;
  },
  {
    name: "fetch_user_orders",
    description:
      "Fetch a specific order by ID, or the full orders sorted by latest if no ID is provided.",
    schema: z.object({
      orderId: z
        .string()
        .optional()
        .describe("The specific Order ID if mentioned by the user"),
    }),
  }
);
