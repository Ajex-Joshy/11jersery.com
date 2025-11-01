import cron from "node-cron";
import { deactivateInactiveUsers } from "../services/admin/user.services.js";
import logger from "../config/logger.js";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await deactivateInactiveUsers();
    logger.info(`Deactivated ${result.modifiedCount} users`);
  } catch (error) {
    logger.error("Error deactivating inactive users:", error);
  }
});
