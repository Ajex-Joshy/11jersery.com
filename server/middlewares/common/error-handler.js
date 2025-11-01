import logger from "../../config/logger.js";

export const errorHandler = (err, req, res, _next) => {
  logger.error(err.message);
  const statusCode = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message =
    err.message ||
    "An unexpected error occurred. We are investigating the issue.";
  res.status(statusCode).json({ error: { code, message } });
};
