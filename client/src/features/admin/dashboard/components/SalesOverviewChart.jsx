import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupee } from "../../../../utils/currency";

const SalesOverviewChart = ({ data, filter, onFilterChange }) => {
  // Transform API data for Recharts if necessary
  // Assuming data is [{ _id: "2023-10-25", totalSales: 1500 }, ...]

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Sales Overview Report
        </h2>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="border border-gray-300 rounded-md text-sm py-1.5 px-3 focus:ring-green-600 focus:border-green-600 bg-white"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSalesGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="_id"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              tickFormatter={(value) => `₹${value / 100}`}
            />
            <CartesianGrid
              vertical={false}
              stroke="#E5E7EB"
              strokeDasharray="3 3"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`${formatRupee(value)}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="totalSales"
              stroke="#16A34A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSalesGreen)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverviewChart;
