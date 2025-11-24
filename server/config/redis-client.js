import IORedis from "ioredis";
import logger from "./logger.js";
import { config } from "dotenv";
config();

const redisClient = new IORedis();
// {
//   host: process.env.REDIS_HOST || "redis",
//   port: process.env.REDIS_PORT || 6379,
// }
redisClient.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error: " + err);
});

export default redisClient;
