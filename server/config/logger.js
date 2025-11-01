import pino from "pino";
import { config } from "dotenv";
config();

// Dev options: pretty-printing to console
const devOptions = {
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  level: "debug",
};

// Prod options: JSON logging to multiple files
const prodOptions = {
  // Paths to redact. Never log sensitive data!
  redact: ["req.headers.authorization", "req.body.password", "req.body.token"],
  level: "info",
  transport: {
    // Use 'pino.transport' to spin up separate processes for logging
    targets: [
      {
        level: "info",
        target: "pino/file", // Pino's built-in file transport
        options: { destination: "logs/combined.log", mkdir: true }, // Create dir if not exist
      },
      {
        level: "error",
        target: "pino/file",
        options: { destination: "logs/error.log", mkdir: true },
      },
    ],
  },
};

const logger = pino(
  process.env.NODE_ENV === "production" ? prodOptions : devOptions
);

export default logger;
