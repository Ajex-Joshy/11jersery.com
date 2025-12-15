import React from "react";
import { useNavigate } from "react-router-dom";
import { useTableParams } from "../../../hooks/useTableParams";
import { useAdminOrders } from "./orderHooks";
import OrderStatsGrid from "./components/OrderStatsGrid";
import StatusBadge from "./components/StatusBadge";
import DynamicTable from "../../../components/admin/DynamicTable";
import { Eye } from "lucide-react";
import { orderStatusOptions } from "../../../utils/constants.js";
import { ErrorDisplay } from "../../../components/common/StateDisplays.jsx";
import { formatRupee } from "../../../utils/currency.js";

const OrderManagement = () => {
  const navigate = useNavigate();

  // 1. Use Table Params Hook (Handles URL state)
  const { queryParams, uiState, handlers } = useTableParams({
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // 2. Fetch Data
  const {
    data: ordersPayload,
    isLoading,
    isError,
    error,
  } = useAdminOrders(queryParams);
  if (isError) return <ErrorDisplay error={error} />;

  const orders = ordersPayload?.data?.orders || [];
  const pagination = ordersPayload?.data?.pagination;
  const stats = ordersPayload?.data?.stats;
  // Define the options

  // 3. Define Columns
  const columns = [
    {
      header: "No.",
      key: "sno",
      render: (_, index) =>
        (queryParams.page - 1) * queryParams.limit + index + 1,
    },
    {
      header: "Order ID",
      key: "orderId",
      render: (item) => (
        <span className="font-mono font-medium">#{item.orderId}</span>
      ),
    },
    {
      header: "Product", // Just showing first product for brevity in table
      key: "productName",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 truncate max-w-[200px]">
            {item.productName}
          </p>
          {item.itemsCount > 1 && (
            <span className="text-xs text-gray-500">
              + {item.itemsCount - 1} other items
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Customer",
      key: "customerName",
      render: (item) => (
        <span className="text-gray-700">{item.customerName}</span>
      ),
    },
    {
      header: "Date",
      key: "createdAt",
      sortable: true,
      render: (item) => new Date(item.date).toLocaleDateString("en-IN"),
    },
    {
      header: "Price",
      key: "totalAmount",
      sortable: true,
      render: (item) => (
        <span className="font-bold text-gray-900">
          {formatRupee(item?.price)}
        </span>
      ),
    },
    {
      header: "Payment",
      key: "paymentStatus",
      render: (item) => (
        <span
          className={`flex items-center gap-1.5 text-xs font-medium ${
            item.paymentStatus === "Paid" ? "text-green-600" : "text-orange-600"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              item.paymentStatus === "Paid" ? "bg-green-600" : "bg-orange-600"
            }`}
          ></span>
          {item.paymentStatus}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Action",
      key: "action",
      render: (item) => (
        <button
          onClick={() => navigate(`/admin/orders/${item._id}`)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
          title="View Details"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  // 4. Filter Options (You can fetch these dynamically if needed)
  // For now, passing them manually to the generic status handler
  // You might need to extend DynamicTable to support custom tabs if you want the exact tabs UI from Figma
  // For now, we'll use the dropdown filter provided by DynamicTable

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Order Management
      </h1>

      {/* Stats Grid */}
      <OrderStatsGrid stats={stats} />

      {/* Orders Table */}
      <DynamicTable
        title="Order List"
        columns={columns}
        data={orders}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        statusOptions={orderStatusOptions}
        // Pass state and handlers
        searchValue={uiState.searchTerm}
        status={uiState.status}
        limit={uiState.limit}
        sortConfig={uiState.sortConfig}
        onSearchChange={handlers.onSearchChange}
        onStatusChange={handlers.onStatusChange}
        onLimitChange={handlers.onLimitChange}
        onSort={handlers.onSort}
        onPageChange={handlers.onPageChange}
      />
    </div>
  );
};

export default OrderManagement;
