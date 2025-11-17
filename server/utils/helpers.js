import slugify from "slugify";
import { STATUS_CODES } from "./constants.js";

export class AppError extends Error {
  constructor(
    status = STATUS_CODES.INTERNAL_SERVER_ERROR,
    code = "INTERNAL_SERVER_ERROR",
    message = "An unexpected error occurred. We are investigating the issue."
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
  }
}

export const sendResponse = (res, data, statusCode = STATUS_CODES.OK) => {
  res.status(statusCode).json({
    data,
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Returns a Date object representing 'n' days ago from today
export const getDaysAgoDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0); // Optional: reset to start of the day
  return date;
};

export const buildUserQuery = ({ status, search }) => {
  const query = {};
  if (status) query.status = status;
  if (search && search.trim() !== "") {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  return query;
};
export const buildCategoryQuery = ({ status, search }) => {
  const query = { isDeleted: false };
  if (status) {
    if (status === "active") query.isListed = true;
    else query.isListed = false;
  }
  if (search && search.trim() !== "") {
    query.title = { $regex: search, $options: "i" };
  }
  return query;
};

export const getPagination = (page = 1, limit = 10, maxLimit = 25) => {
  const pageNumber = parseInt(page);
  const pageSize = Math.min(parseInt(limit), maxLimit);
  const skip = (pageNumber - 1) * pageSize;
  return { pageNumber, pageSize, skip };
};

export const getSortOption = (sortBy = "createdAt", sortOrder = "desc") => ({
  [sortBy]: sortOrder === "asc" ? 1 : -1,
});

export const createSlug = (text) => {
  if (!text || typeof text !== "string") return "";
  return slugify(text, {
    lower: true,
    strict: true, // removes special characters
    trim: true, // trims whitespace
  });
};
