import logger from "../config/logger.js";
import "./deactivate-users.job.js";
import "./cancelInitializedOrders.js";

export const initCronJobs = () => {
  logger.info("Cron jobs initialized");
};
