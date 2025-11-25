import React, { useState } from "react";
import { useWalletData } from "./walletHooks";
import WalletBalanceCard from "./components/WalletBalanceCard";
import TransactionList from "./components/TransactionList";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../../components/common/StateDisplays";
import { Filter } from "lucide-react";
import Pagination from "../../../../components/common/Pagination";

const WalletPage = () => {
  // --- Local State for Filters ---
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState(""); // '' (All) | 'CREDIT' | 'DEBIT'

  // --- Data Fetching ---
  const {
    data: walletPayload,
    isLoading,
    isError,
    error,
  } = useWalletData({
    page,
    limit: 5,
    type: filterType || undefined, // Don't send empty string
  });

  const balance = walletPayload?.data?.balance || 0;
  const transactions = walletPayload?.data?.transactions || [];
  const pagination = walletPayload?.data?.pagination;

  // --- Handlers ---
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setPage(1);
  };

  if (isLoading) return <LoadingSpinner text="Loading wallet..." />;
  if (isError) return <ErrorDisplay error={error} />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>

      {/* Balance Card */}
      <WalletBalanceCard balance={balance} />

      {/* Filters & Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Recent Transactions
        </h2>

        <div className="relative">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black bg-white"
          >
            <option value="">All Transactions</option>
            <option value="CREDIT">Credits (+)</option>
            <option value="DEBIT">Debits (-)</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <TransactionList transactions={transactions} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

export default WalletPage;
