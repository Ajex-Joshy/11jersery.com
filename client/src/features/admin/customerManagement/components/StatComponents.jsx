import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const MainStatCard = ({ title, value, percentage, timeframe }) => {
  const isPositive = percentage >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-20 ">
      <h3 className="text-md font-semibold text-gray-700">{title}</h3>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div
          className={`flex items-center text-sm font-medium ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {percentage.toFixed(1)}%
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{timeframe}</p>
    </div>
  );
};

export const OverviewStat = ({ value, title }) => (
  <div className="text-center md:text-left">
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);
