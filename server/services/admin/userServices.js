import User from "../../models/userModel.js";

export const getUsers = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit) > 25 ? 25 : parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [result, totalUsers] = await Promise.all([
    User.find(query).sort(sort).skip(skip).limit(pageSize).select("-password"),
    User.countDocuments(query),
  ]);

  return {
    users: result,
    pagination: {
      totalUsers,
      currentpage: pageNumber,
      totalPages: Math.ceil(totalUsers / pageSize),
      limit: pageSize,
    },
  };
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
