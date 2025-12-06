import { MongoClient } from "mongodb";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import logger from "../../config/logger.js";
import { env } from "../../config/env.js";

const client = new MongoClient(env.MONGO_URI);

let checkpointer = null;

export const getCheckpointer = async () => {
  logger.info("Checkpointer initialized", checkpointer);
  if (checkpointer) return checkpointer;
  try {
    await client.connect();
    checkpointer = new MongoDBSaver({
      client,
      dbName: "11jersey",
      checkpointCollectionName: "chat_history",
    });
    logger.info("checkpointer connected");
    return checkpointer;
  } catch (err) {
    logger.error(" Failed to init checkpointer", err);
    throw err;
  }
};
