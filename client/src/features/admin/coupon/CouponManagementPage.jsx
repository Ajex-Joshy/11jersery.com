import React, { useState } from "react";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";
import {
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "./couponHooks.js";
import CouponForm from "./components/CouponForm.jsx";
import { useTableParams } from "../../../hooks/useTableParams";
import DynamicTable from "../../../components/admin/DynamicTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { formatRupee } from "../../../utils/currency.js";

const CouponManagementPage = () => {
  const { queryParams, uiState, handlers } = useTableParams({
    defaultSortBy: "createdAt",
  });
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null }); // type: 'create', 'edit', 'delete'

  // Hooks
  const { data: couponsPayload, isLoading, error } = useCoupons(queryParams);
  const { mutate: createCoupon, isLoading: isCreating } = useCreateCoupon();
  const { mutate: updateCoupon, isLoading: isUpdating } = useUpdateCoupon();
  const { mutate: deleteCoupon, isLoading: isDeleting } = useDeleteCoupon();

  const coupons = couponsPayload?.data?.coupons || [];
  const pagination = couponsPayload?.data?.pagination;

  // Handlers
  const handleCreate = (data) => {
    createCoupon(data, { onSuccess: () => setModal({ isOpen: false }) });
  };

  const handleUpdate = (data) => {
    updateCoupon(
      { couponId: modal?.data?._id || data._id, data },
      { onSuccess: () => setModal({ isOpen: false }) }
    );
  };

  const handleDelete = () => {
    deleteCoupon(modal.data._id, {
      onSuccess: () => setModal({ isOpen: false }),
    });
  };

  const openModal = (type, data = null) =>
    setModal({ isOpen: true, type, data });

  // Columns
  const columns = [
    {
      header: "Code",
      key: "code",
      render: (item) => (
        <span className="font-mono font-bold">{item.code}</span>
      ),
    },
    {
      header: "Discount",
      key: "discount",
      render: (item) => (
        <span>
          {item.discountType === "PERCENTAGE"
            ? `${item.discountValue}%`
            : `${formatRupee(item.discountValue)}`}
          {item.discountType === "PERCENTAGE" && item.maxDiscountAmount && (
            <span className="text-xs text-gray-500 block">
              Max: {formatRupee(item.maxDiscountAmount)}
            </span>
          )}
        </span>
      ),
    },
    {
      header: "Min Purchase",
      key: "minPurchaseAmount",
      render: (item) => `${formatRupee(item.minPurchaseAmount)}`,
    },
    {
      header: "Usage",
      key: "usage",
      render: (item) => (
        <div className="text-xs">
          <p>Used: {item.usedCount}</p>
          <p className="text-gray-500">Limit: {item.usageLimit || "∞"}</p>
        </div>
      ),
    },
    {
      header: "Status",
      key: "isActive",
      render: (item) => {
        const isExpired = new Date(item.expiryDate) < new Date();
        let statusColor = "bg-green-100 text-green-800";
        let statusText = "Active";

        if (!item.isActive) {
          statusColor = "bg-gray-100 text-gray-800";
          statusText = "Inactive";
        } else if (isExpired) {
          statusColor = "bg-red-100 text-red-800";
          statusText = "Expired";
        }

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      header: "Validity",
      key: "dates",
      render: (item) => (
        <div className="text-xs text-gray-500">
          <p>Start: {new Date(item.startDate).toLocaleString()}</p>
          <p>End: {new Date(item.expiryDate).toLocaleString()}</p>
        </div>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (item) => (
        <div className="flex items-center gap-3">
          {/* Professional Toggle Button */}
          <button
            onClick={() => handleUpdate({ ...item, isActive: !item.isActive })}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
              ${item.isActive ? "bg-green-600" : "bg-gray-200"}
            `}
            title={item.isActive ? "Deactivate" : "Activate"}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${item.isActive ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>

          <button
            onClick={() => openModal("edit", item)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => openModal("delete", item)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="text-black" /> Coupon Management
        </h1>
        <button
          onClick={() => openModal("create")}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <DynamicTable
        title="All Coupons"
        columns={columns}
        data={coupons}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        searchValue={uiState.searchTerm}
        onSearchChange={handlers.onSearchChange}
        status={uiState.status}
        onStatusChange={handlers.onStatusChange}
        limit={uiState.limit}
        onLimitChange={handlers.onLimitChange}
        sortConfig={uiState.sortConfig}
        onSort={handlers.onSort}
        onPageChange={handlers.onPageChange}
      />

      {/* Create/Edit Modal */}
      {(modal.type === "create" || modal.type === "edit") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {modal.type === "create" ? "Add New Coupon" : "Edit Coupon"}
            </h2>
            <CouponForm
              initialData={modal.data}
              isLoading={isCreating || isUpdating}
              onSubmit={modal.type === "create" ? handleCreate : handleUpdate}
              onCancel={() => setModal({ isOpen: false })}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.type === "delete"}
        onClose={() => setModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Coupon?"
        message={`Are you sure you want to delete coupon "${modal.data?.code}"?`}
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CouponManagementPage;
