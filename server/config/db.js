import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error(`ERROR: ${err.message}`);
  }
};

export default connectDB;
