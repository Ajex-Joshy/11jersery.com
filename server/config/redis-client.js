import IORedis from "ioredis";
import logger from "./logger.js";

import { env } from "./env.js";

const redisClient = new IORedis({
  host: "localhost",
  port: env.REDIS_PORT,
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error: " + err);
});

export default redisClient;
