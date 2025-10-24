import logger from "../../utils/logger.js";

export const errorHandler = (err, req, res) => {
  const statusCode = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  logger.error(err.message);
  const message =
    statusCode === 500
      ? "An unexpected error occurred. We are investigating the issue."
      : err.message;

  res.status(statusCode).json({ error: { code, message } });
};
