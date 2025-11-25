import Razorpay from "razorpay";
import { config } from "dotenv";
config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_API_KEY,
  key_secret: process.env.RAZORPAY_TEST_SECRET_KEY,
});

export default razorpayInstance;
