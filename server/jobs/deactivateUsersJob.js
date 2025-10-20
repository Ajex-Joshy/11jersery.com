import cron from "node-cron";
import { deactivateInactiveUsers } from "../services/admin/userServices.js";

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await deactivateInactiveUsers();
    console.log(`Deactivated ${result.modifiedCount} users`);
  } catch (error) {
    console.error("Error deactivating inactive users:", error);
  }
});
