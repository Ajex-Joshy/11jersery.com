import React from "react";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import TransactionItem from "./TransactionItem";

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
