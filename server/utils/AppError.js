export class AppError extends Error {
  constructor(
    status = 500,
    code = "INTERNAL_SERVER_ERROR",
    message = "An unexpected error occurred. We are investigating the issue."
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
  }
}
