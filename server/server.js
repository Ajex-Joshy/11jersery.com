import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin/adminRoutes.js";
import userRoutes from "./routes/user/userRoutes.js";
import { config } from "dotenv";
import { errorHandler } from "./middlewares/common/errorHandler.js";
config();

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () =>
      console.log(
        `server running on PORT: ${process.env.PORT} -> http://localhost:3000/`
      )
    );
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
};

startServer();

app.use(express.json());
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.use(errorHandler);
