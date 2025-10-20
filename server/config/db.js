import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
};

export default connectDB;
