import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
};

export default connectDB;
