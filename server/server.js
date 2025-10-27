import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin/adminRoutes.js";
import userRoutes from "./routes/user/userRoutes.js";
import { initCronJobs } from "./jobs/index.js";
import { config } from "dotenv";
import { errorHandler } from "./middlewares/common/errorHandler.js";
config();
import cors from "cors";
import logger from "./utils/logger.js";
import { pinoHttp } from "pino-http";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

const httpLogger = pinoHttp({
  logger,
});

app.use(express.json());
// app.use(httpLogger);

app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () =>
      logger.info("Server started successfully")
    );
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

startServer();
initCronJobs();
