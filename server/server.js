import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin/adminRoutes.js";
import userRoutes from "./routes/user/userRoutes.js";
import { initCronJobs } from "./jobs/index.js";
import { config } from "dotenv";
import { errorHandler } from "./middlewares/common/errorHandler.js";
config();
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

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
    process.exit(1);
  }
};

startServer();
initCronJobs();

app.use(express.json());
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.use(errorHandler);
