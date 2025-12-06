import express from "express";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import userRoutes from "./routes/user/user.routes.js";
import { initCronJobs } from "./jobs/index.job.js";
import { errorHandler } from "./middlewares/common/error-handler.js";
import { env } from "./config/env.js";
import cors from "cors";
import logger from "./config/logger.js";
import { pinoHttp } from "pino-http";
import {
  register,
  httpRequestCounter,
  httpRequestDurationMicroseconds,
} from "./config/metrics.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket/socketHandler.js";

const app = express();

app.use(
  cors({
    origin: [
      "https://years-applicants-first-guns.trycloudflare.com",
      env.FRONTEND_URL,
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
const httpLogger = pinoHttp({
  logger,
});

app.use(express.json());
// app.use(httpLogger);

app.use((req, res, next) => {
  // Start a timer for request duration
  const end = httpRequestDurationMicroseconds.startTimer();

  const route = req.originalUrl.split("?")[0];

  res.on("finish", () => {
    // When the response finishes, record the metrics
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode,
    };

    // Increment the counter
    httpRequestCounter.inc(labels);
    // Observe the duration
    end(labels);
  });

  next();
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initializeSocket(io);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/", userRoutes);
app.use(errorHandler);
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(env.PORT, () => logger.info("Server started successfully"));
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

startServer();
initCronJobs();
