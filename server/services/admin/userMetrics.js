import User from "../../models/userModel.js";

export const getTotalCustomers = async () => {
  return await User.countDocuments({ status: "active" });
};

export const getNewCustomers = async (startDate, endDate) => {
  return await User.countDocuments({
    status: "active",
    createdAt: { $gte: startDate, $lte: endDate },
  });
};

export const getVisitors = async (startDate, endDate) => {
  return await User.countDocuments({
    lastLogin: { $gte: startDate, $lte: endDate },
  });
};

export const getRepeatCustomers = async () => {
  const repeatCustomersAgg = await User.aggregate([
    {
      $match: {
        status: "active",
        lastLogin: { $exists: true, $ne: null },
      },
    },
    {
      $project: {
        isRepeat: {
          $gt: [
            { $subtract: ["$lastLogin", "$createdAt"] },
            24 * 60 * 60 * 1000, // 1 day in ms
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        repeatCount: {
          $sum: {
            $cond: ["$isRepeat", 1, 0],
          },
        },
      },
    },
  ]);
  const repeatCustomers =
    repeatCustomersAgg.length > 0 ? repeatCustomersAgg[0].repeatCount : 0;
  return repeatCustomers;
};

export const getDailyActivity = async (startDate, endDate) => {
  const newCustomersDaily = await User.aggregate([
    {
      $match: {
        status: "active",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Prepare dailyActivity array dynamically based on startDate and endDate
  const dailyActivity = [];

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);

    const newCust = newCustomersDaily.find((item) => item._id === dateStr);

    dailyActivity.push({
      date: dateStr,
      newCustomers: newCust ? newCust.count : 0,
    });
  }

  return dailyActivity;
};

export const calcPercentageChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};
