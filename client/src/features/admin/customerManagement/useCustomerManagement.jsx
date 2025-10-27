import { useState } from "react";
import { useTableParams } from "../../../hooks/useTableParams.jsx";
import {
  useCustomers,
  useCustomerStats,
  useToggleUserBlock,
} from "./customerHooks.js";
import {
  ActionToggleButton,
  StatusBadge,
} from "../../../components/admin/UiElements.jsx";
import { transformCustomerStats } from "./customerDataTransformer.js";

/**
 * This hook is the "brain" for the CustomerManagement page.
 * It handles all state, data fetching, and business logic.
 * The component itself will just be for rendering.
 */
export const useCustomerManagement = () => {
  // --- STATE & HOOKS ---

  // 3. All URL/filter logic is  handled by this one hook.
  const { queryParams, uiState, handlers } = useTableParams({
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
  });

  // Page-specific state (modal) remains here.
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  // --- DATA FETCHING ---
  const {
    data: customerData,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
    error: errorCustomers,
  } = useCustomers(queryParams);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: errorStats,
  } = useCustomerStats();

  const { mutate: toggleBlock, isLoading: isTogglingBlock } =
    useToggleUserBlock();

  // --- MODAL HANDLERS (Page-specific logic) ---
  const handleConfirmToggle = () => {
    const item = modalState.item;
    if (!item) return;
    toggleBlock(
      { userId: item._id, isBlocked: !item.isBlocked },
      { onSettled: () => setModalState({ isOpen: false, item: null }) }
    );
  };

  const openConfirmationModal = (item) => {
    setModalState({ isOpen: true, item: item });
  };

  const closeConfirmationModal = () => {
    setModalState({ isOpen: false, item: null });
  };

  // --- COLUMN DEFINITIONS (Page-specific logic) ---

  // --- COLUMN DEFINITIONS ---
  const customerColumns = [
    {
      header: "Customer Id",
      key: "id",
      sortable: false,
      render: (item) => (
        <span className="font-medium text-gray-900">
          #{item._id.slice(-7).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Name",
      key: "firstName",
      sortable: true,
      render: (item) => (
        <span className="text-gray-700">
          {item.firstName} {item.lastName}
        </span>
      ),
    },
    {
      header: "Phone",
      key: "phone",
      sortable: false,
      render: (item) => <span className="text-gray-700">{item.phone}</span>,
    },
    {
      header: "Order Count",
      key: "orderCount",
      sortable: false,
      render: (item) => (
        <span className="text-gray-700">{item.orderCount || 25}</span>
      ), // Placeholder
    },
    {
      header: "Total Spend",
      key: "totalSpend",
      sortable: false,
      render: (item) => (
        <span className="text-gray-700">
          ₹{(item.totalSpend || 3450.0).toFixed(2)}
        </span>
      ), // Placeholder
    },
    {
      header: "Status",
      key: "status",
      sortable: false,
      render: (item) => (
        <StatusBadge status={item.status} isBlocked={item.isBlocked} />
      ),
    },
    {
      header: "Action",
      key: "action",
      sortable: false,
      render: (item) => {
        return (
          <ActionToggleButton
            isBlocked={item.isBlocked}
            isLoading={false}
            onClick={() => openConfirmationModal(item)}
          />
        );
      },
    },
  ];

  // --- DATA TRANSFORMATION (Page-specific logic) ---
  const { mainStats, overviewStats, chartData } =
    transformCustomerStats(statsData);
  const customers = customerData?.data?.users || [];
  const pagination = customerData?.data?.pagination;

  // --- RETURN VALUE ---
  return {
    isLoading: isLoadingCustomers || isLoadingStats,
    isError: isErrorCustomers || isErrorStats,
    error: errorCustomers || errorStats,

    stats: { mainStats, overviewStats, chartData },

    table: {
      columns: customerColumns,
      data: customers,
      pagination: pagination,
    },

    // 7. Pass through the UI state and handlers from the useTableParams hook
    filters: {
      ...uiState,
      handleSearch: handlers.onSearchChange,
      handleStatusChange: handlers.onStatusChange,
      handleLimitChange: handlers.onLimitChange,
      handleSort: handlers.onSort,
      handlePageChange: handlers.onPageChange,
    },

    modal: {
      isOpen: modalState.isOpen,
      item: modalState.item,
      isLoading: isTogglingBlock,
      onClose: closeConfirmationModal,
      onConfirm: handleConfirmToggle,
    },
  };
};
