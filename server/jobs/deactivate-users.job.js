import cron from "node-cron";
import { deactivateInactiveUsers } from "../services/admin/user.services.js";
import logger from "../config/logger.js";
import { config } from "dotenv";
config();

cron.schedule(process.env.DEATIVATE_USER_CRON_EXP, async () => {
  try {
    const result = await deactivateInactiveUsers();
    logger.info(`Deactivated ${result.modifiedCount} users`);
  } catch (error) {
    logger.error("Error deactivating inactive users:", error);
  }
});
