import React, { useState } from "react";
import { TrendingUp, Users, ShoppingBag, Wallet } from "lucide-react";
import { useDashboardStats } from "./dashboardHooks";
import { useSalesReport } from "../report/reportHooks";

import SalesOverviewChart from "./components/SalesOverviewChart";
import TopPerformingTable from "./components/TopPerformingTable";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";

// Helper for Summary Cards
const SummaryCard = ({ title, value, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`font-medium ${
          trend >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {trend > 0 ? "+" : ""}
        {trend}%
      </span>
      <span className="text-gray-400">vs last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  // 1. Fetch General Stats
  const { data: statsPayload, isLoading, isError, error } = useDashboardStats();

  // 2. Local state for Chart Filter
  const [chartPeriod, setChartPeriod] = useState("daily");

  // 3. Fetch Chart Data (using the Report hook!)
  const { data: reportPayload, isLoading: isChartLoading } = useSalesReport({
    period: chartPeriod,
    limit: 1000, // Get enough points for the chart
  });

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." />;
  if (isError) return <ErrorDisplay error={error} />;

  const { stats, bestSellingProducts, bestSellingCategories } =
    statsPayload?.payload || {};
  const chartData = reportPayload?.payload?.report || [];

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* --- Top Stats Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Revenue"
          value={`₹${stats.monthly?.currentRevenue?.toLocaleString() || 0}`}
          trend={stats.monthly?.growthPercentage || 0}
          icon={Wallet}
          colorClass="bg-green-50 text-green-600"
        />
        <SummaryCard
          title="Total Orders"
          value={stats.monthly?.currentOrders || 0}
          trend={12} // Placeholder or calculate real trend
          icon={ShoppingBag}
          colorClass="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          title="Cancelled Orders"
          value={stats.monthly?.cancelled || 0}
          trend={-5} // Negative is good here usually, but trend logic might differ
          icon={Users} // Or XCircle
          colorClass="bg-red-50 text-red-600"
        />
        {/* Add one more card if needed */}
      </div>

      {/* --- Main Chart Section --- */}
      <div className="mb-8">
        <SalesOverviewChart
          data={chartData}
          filter={chartPeriod}
          onFilterChange={setChartPeriod}
        />
      </div>

      {/* --- Top Lists Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopPerformingTable
          title="Best Selling Products"
          data={bestSellingProducts || []}
          type="product"
        />
        <TopPerformingTable
          title="Best Selling Categories"
          data={bestSellingCategories || []}
          type="category"
        />
      </div>
    </div>
  );
};

export default Dashboard;
