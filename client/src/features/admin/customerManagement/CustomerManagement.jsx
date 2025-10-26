import React from "react";
import { useCustomerManagement } from "./useCustomerManagement.jsx";

import { MainStatCard, OverviewStat } from "./components/StatComponents.jsx";
import { CustomerLineChart } from "./components/CustomerLineChart.jsx";
import DynamicTable from "../../../components/admin/DynamicTable.jsx";
import ConfirmationModal from "../../../components/common/ConfirmationModal.jsx";

const CustomerManagement = () => {
  const { isLoading, isError, error, stats, table, filters, modal } =
    useCustomerManagement();

  // --- LOADING / ERROR STATES ---
  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-4">Loading customer data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-red-500 mt-4">Error loading data: {error.message}</p>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customers</h1>

      {/* --- Top Stats Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 divide-gray-200 space-y-4">
          {stats.mainStats.map((stat) => (
            <MainStatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              percentage={stat.percentage}
              timeframe="Last 7 days"
            />
          ))}
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Customer Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            {stats.overviewStats.map((stat) => (
              <OverviewStat
                key={stat.title}
                value={stat.value}
                title={stat.title}
              />
            ))}
          </div>
          <div className="mt-8" style={{ width: "100%", height: "250px" }}>
            <CustomerLineChart data={stats.chartData} />
          </div>
        </div>
      </div>

      {/* --- Bottom Customer List Table --- */}
      <div className="mt-6">
        <DynamicTable
          title="Customer List"
          columns={table.columns}
          data={table.data}
          pagination={table.pagination}
          isLoading={isLoading}
          error={error}
          // Pass all filter state and handlers
          searchValue={filters.searchTerm}
          onSearchChange={filters.handleSearch}
          status={filters.status}
          onStatusChange={filters.handleStatusChange}
          limit={filters.limit}
          onLimitChange={filters.handleLimitChange}
          sortConfig={filters.sortConfig}
          onSort={filters.handleSort}
          onPageChange={filters.handlePageChange}
        />
      </div>

      {/* --- Confirmation Modal --- */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        onConfirm={modal.onConfirm}
        title={modal.item?.isBlocked ? "Unblock Customer?" : "Block Customer?"}
        message={`Are you sure you want to ${
          modal.item?.isBlocked ? "unblock" : "block"
        } ${modal.item?.firstName} ${modal.item?.lastName}?`}
        confirmButtonText={
          modal.item?.isBlocked ? "Yes, Unblock" : "Yes, Block"
        }
        confirmButtonVariant="danger"
        isLoading={modal.isLoading}
      />
    </div>
  );
};

export default CustomerManagement;
