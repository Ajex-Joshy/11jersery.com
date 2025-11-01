import User from "../../models/user.model.js";

import {
  AppError,
  buildUserQuery,
  getDaysAgoDate,
  getPagination,
  getSortOption,
} from "../../utils/helpers.js";
import {
  calcPercentageChange,
  getDailyActivity,
  getNewCustomers,
  getRepeatCustomers,
  getTotalCustomers,
  getVisitors,
} from "./service-helpers/user-metrics.js";
import { validateObjectId } from "../../utils/product.utils.js";

export const getUsers = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const query = buildUserQuery({ status, search });

  const sort = getSortOption(sortBy, sortOrder);
  const { pageNumber, pageSize, skip } = getPagination(page, limit);

  const [result, totalUsers] = await Promise.all([
    User.find(query).sort(sort).skip(skip).limit(pageSize).select("-password"),
    User.countDocuments(query),
  ]);

  return {
    users: result,
    pagination: {
      totalUsers,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalUsers / pageSize),
      limit: pageSize,
    },
  };
};

export const getUsersStats = async () => {
  const now = new Date();
  const sevenDaysAgo = getDaysAgoDate(6);
  const fourteenDaysAgo = getDaysAgoDate(13);

  const [
    totalCustomers,
    newCustomersLast7,
    newCustomersPrev7,
    visitorsLast7,
    visitorsPrev7,
    repeatCustomers,
    dailyActivity,
  ] = await Promise.all([
    getTotalCustomers(),
    getNewCustomers(sevenDaysAgo, now),
    getNewCustomers(fourteenDaysAgo, sevenDaysAgo),
    getVisitors(sevenDaysAgo, now),
    getVisitors(fourteenDaysAgo, sevenDaysAgo),
    getRepeatCustomers(),
    getDailyActivity(sevenDaysAgo, now),
  ]);

  return {
    totalCustomers: {
      value: totalCustomers,
      percentageChange: calcPercentageChange(
        newCustomersLast7,
        newCustomersPrev7
      ),
    },
    newCustomers: {
      count: newCustomersLast7,
      percentageChange: calcPercentageChange(
        newCustomersLast7,
        newCustomersPrev7
      ),
    },
    visitors: {
      count: visitorsLast7,
      percentageChange: calcPercentageChange(visitorsLast7, visitorsPrev7),
    },
    customerOverview: {
      active: totalCustomers,
      repeat: repeatCustomers,
      shopVisitor: visitorsLast7,
      conversionRate:
        visitorsLast7 === 0
          ? 0
          : ((newCustomersLast7 / visitorsLast7) * 100).toFixed(2),
    },
    dailyActivity,
  };
};

export const updateUserStatus = async (userId, isBlocked) => {
  if (typeof isBlocked !== "boolean") {
    throw new AppError(400, "INVALID_STATUS", "Status should be boolean");
  }

  validateObjectId(userId);

  const status = isBlocked ? "blocked" : "active";
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked, status },
    { new: true }
  );

  if (!user) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "The user with the specified ID could not be found."
    );
  }

  return user;
};

export const deactivateInactiveUsers = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const result = await User.updateMany(
    { lastLogin: { $lt: threeMonthsAgo }, status: "active" },
    { $set: { status: "inactive" } }
  );

  return result;
};
