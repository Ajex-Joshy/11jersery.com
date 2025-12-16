import IORedis from "ioredis";
import logger from "./logger.js";

import { env } from "./env.js";

const redisClient = new IORedis({
  host: env.NODE_ENV === "development" ? "127.0.0.1" : env.REDIS_HOST,
  port: env.REDIS_PORT,
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error: " + err);
});

export default redisClient;
