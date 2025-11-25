import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PropTypes from "prop-types";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center text-xs font-medium">
      {trend === "up" ? (
        <span className="text-green-600 flex items-center gap-1">
          <TrendingUp size={14} /> +{trendValue}%
        </span>
      ) : (
        <span className="text-red-600 flex items-center gap-1">
          <TrendingDown size={14} /> -{trendValue}%
        </span>
      )}
      <span className="text-gray-400 ml-2">Last 7 days</span>
    </div>
  </div>
);

const OrderStatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Orders"
        value={stats?.totalOrders || 0}
        icon={Package}
        trend="up"
        trendValue="14.4"
        color="bg-blue-50 text-blue-600"
      />
      <StatCard
        title="New Orders"
        value={stats?.newOrders || 0}
        icon={Truck}
        trend="up"
        trendValue="20.0"
        color="bg-orange-50 text-orange-600"
      />
      <StatCard
        title="Completed Orders"
        value={stats?.completedOrders || 0}
        icon={CheckCircle}
        trend="up"
        trendValue="85.0"
        color="bg-green-50 text-green-600"
      />
      <StatCard
        title="Cancelled Orders"
        value={stats?.canceledOrders || 0}
        icon={XCircle}
        trend="down"
        trendValue="5.0"
        color="bg-red-50 text-red-600"
      />
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.oneOf(["up", "down"]).isRequired,
  trendValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  color: PropTypes.string.isRequired,
};

OrderStatsGrid.propTypes = {
  stats: PropTypes.shape({
    totalOrders: PropTypes.number,
    newOrders: PropTypes.number,
    completedOrders: PropTypes.number,
    canceledOrders: PropTypes.number,
  }),
};

OrderStatsGrid.defaultProps = {
  stats: {
    totalOrders: 0,
    newOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
  },
};

export default OrderStatsGrid;
