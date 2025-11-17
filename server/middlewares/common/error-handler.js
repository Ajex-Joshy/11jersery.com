import logger from "../../config/logger.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const errorHandler = (err, req, res, _next) => {
  logger.error(err);
  const statusCode = err.status || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message =
    err.message ||
    "An unexpected error occurred. We are investigating the issue.";
  res.status(statusCode).json({ error: { code, message } });
};
