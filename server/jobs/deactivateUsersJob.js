import cron from "node-cron";
import { deactivateInactiveUsers } from "../services/admin/userServices.js";
import logger from "../utils/logger.js";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await deactivateInactiveUsers();
    logger.info(`Deactivated ${result.modifiedCount} users`);
  } catch (error) {
    logger.error("Error deactivating inactive users:", error);
  }
});
