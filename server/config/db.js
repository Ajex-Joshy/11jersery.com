import mongoose from "mongoose";
import logger from "./logger.js";
import { env } from "./env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    logger.info("connected to monogoDB successfully");
  } catch (err) {
    logger.error(`ERROR: ${err.message}`);
  }
};

export default connectDB;
