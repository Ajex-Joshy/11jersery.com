import IORedis from "ioredis";
import logger from "./logger.js";
// import { env } from "./env.js";
const redisClient = new IORedis();
// {
//   host: env.REDIS_HOST || "redis",
//   port: env.REDIS_PORT || 6379,
// }
redisClient.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redisClient.on("error", (err) => {
  logger.error("Redis connection error: " + err);
});

export default redisClient;
