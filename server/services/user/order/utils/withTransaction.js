import mongoose from "mongoose";
import { AppError } from "../../../../utils/helpers.js";
import { STATUS_CODES } from "../../../../utils/constants.js";

export const withTransaction = async (callback) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    // Handle MongoDB Write Conflict / TransientTransactionError
    if (
      err?.errorResponse?.codeName === "WriteConflict" ||
      err?.errorLabels?.includes("TransientTransactionError")
    ) {
      await session.abortTransaction();
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "WRITE_CONFLICT",
        "Operation failed due to high system load. Please try again."
      );
    }

    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
