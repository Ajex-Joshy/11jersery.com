import React from "react";
import { IndianRupee, ShoppingBag, Tag, TrendingUp } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

const ReportStatsGrid = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Revenue"
        value={`₹${summary.overallOrderAmount?.toLocaleString()}`}
        icon={IndianRupee}
        color="bg-green-50 text-green-600"
      />
      <StatCard
        title="Total Orders"
        value={summary.overallSalesCount}
        icon={ShoppingBag}
        color="bg-blue-50 text-blue-600"
      />

      <StatCard
        title="Discount Savings"
        value={`₹${summary.overallDiscount?.toLocaleString()}`}
        icon={Tag}
        color="bg-orange-50 text-orange-600"
      />
      <StatCard
        title="Special Discount"
        value={`₹${summary.overallSpecialDiscount?.toLocaleString()}`}
        icon={TrendingUp}
        color="bg-purple-50 text-purple-600"
      />
      <StatCard
        title="Coupon Discount"
        value={`₹${summary.overallCouponDiscount?.toLocaleString()}`}
        icon={TrendingUp}
        color="bg-yellow-50 text-yellow-600"
      />
      <StatCard
        title="Referral Bonus"
        value={`₹${summary.overallReferralBonus?.toLocaleString()}`}
        icon={TrendingUp}
        color="bg-pink-50 text-pink-600"
      />
    </div>
  );
};

export default ReportStatsGrid;
