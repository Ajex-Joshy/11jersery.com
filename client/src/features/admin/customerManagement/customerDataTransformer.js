export const transformCustomerStats = (statsData) => {
  const stats = statsData?.data || {};

  const mainStats = [
    {
      title: "Total Customers",
      value: stats.totalCustomers?.value.toLocaleString() || 0,
      percentage: stats.totalCustomers?.percentageChange || 0,
    },
    {
      title: "New Customers",
      value: stats.newCustomers?.count.toLocaleString() || 0,
      percentage: stats.newCustomers?.percentageChange || 0,
    },
    {
      title: "Visitor",
      value: stats.visitors?.count.toLocaleString() || 0,
      percentage: stats.visitors?.percentageChange || 0,
    },
  ];

  const overviewStats = [
    {
      value: stats.customerOverview?.active.toLocaleString() || 0,
      title: "Active Customers",
    },
    {
      value: stats.customerOverview?.repeat.toLocaleString() || 0,
      title: "Repeat Customers",
    },
    {
      value: stats.customerOverview?.shopVisitor.toLocaleString() || 0,
      title: "Shop Visitor",
    },
    {
      value: `${stats.customerOverview?.conversionRate || 0}%`,
      title: "Conversion Rate",
    },
  ];

  const chartData = stats.dailyActivity || [];

  // Return everything in one object
  return {
    mainStats,
    overviewStats,
    chartData,
  };
};
