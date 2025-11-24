import React from "react";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

const TransactionItem = ({ transaction }) => {
  const isCredit = transaction.type === "CREDIT";
  const isSuccess = transaction.status === "SUCCESS";

  // Icon Logic
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
  const iconColor = isCredit
    ? "text-green-600 bg-green-50"
    : "text-red-600 bg-red-50";

  // Date Formatting
  const date = new Date(transaction.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = new Date(transaction.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-full ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {transaction.reason.replace(/_/g, " ")}{" "}
            {/* e.g. ORDER_REFUND -> ORDER REFUND */}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>{date}</span>
            <span>•</span>
            <span>{time}</span>
            {transaction.orderId && (
              <span className="hidden sm:inline">
                • Order #{transaction.orderId.slice(-6).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p
          className={`font-bold ${isCredit ? "text-green-600" : "text-black"}`}
        >
          {isCredit ? "+" : "-"}₹{transaction.amount.toLocaleString()}
        </p>
        <span
          className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full 
          ${
            isSuccess
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

const TransactionList = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Clock size={48} className="mb-4 opacity-50" strokeWidth={1.5} />
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <h3 className="font-semibold text-gray-900">Transaction History</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {transactions.map((txn) => (
          <TransactionItem key={txn._id} transaction={txn} />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
