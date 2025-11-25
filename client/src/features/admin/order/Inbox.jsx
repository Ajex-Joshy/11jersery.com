import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTableParams } from "../../../hooks/useTableParams";
import {
  useAdminReturnRequests,
  useApproveReturn,
  useRejectReturn,
  useConfirmReturnReceived,
} from "./orderHooks";
import DynamicTable from "../../../components/admin/DynamicTable";
import StatusBadge from "./components/StatusBadge";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { Eye, CheckCircle, XCircle, PackageCheck } from "lucide-react";
import { ErrorDisplay } from "../../../components/common/StateDisplays";

const Inbox = () => {
  const navigate = useNavigate();
  const { queryParams, uiState, handlers } = useTableParams({
    defaultSortBy: "updatedAt",
  });

  // Data Fetching
  const {
    data: returnsPayload,
    isLoading,
    isError,
    error,
  } = useAdminReturnRequests(queryParams);
  const requests = returnsPayload?.data?.requests || [];
  const pagination = returnsPayload?.payload?.pagination;

  // Mutations
  const { mutate: approveMutate, isLoading: isApproving } = useApproveReturn();
  const { mutate: rejectMutate, isLoading: isRejecting } = useRejectReturn();
  const { mutate: confirmMutate, isLoading: isConfirming } =
    useConfirmReturnReceived();

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    orderId: null,
    itemId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  const handleAction = (type, orderId, itemId = null) => {
    setModal({ isOpen: true, type, orderId, itemId });
    setRejectReason("");
  };

  const confirmAction = () => {
    const { type, orderId, itemId } = modal;
    if (type === "approve") {
      approveMutate(
        { orderId, itemId },
        { onSuccess: () => setModal({ ...modal, isOpen: false }) }
      );
    } else if (type === "reject") {
      rejectMutate(
        { orderId, itemId, reason: rejectReason },
        { onSuccess: () => setModal({ ...modal, isOpen: false }) }
      );
    } else if (type === "confirm_receipt") {
      confirmMutate(
        { orderId, itemId },
        { onSuccess: () => setModal({ ...modal, isOpen: false }) }
      );
    }
  };
  if (isError) <ErrorDisplay error={error} />;

  // Columns
  const columns = [
    {
      header: "Order ID",
      key: "orderId",
      render: (item) => (
        <div>
          <span className="font-mono font-medium">#{item.orderId}</span>
          <p className="text-xs text-gray-500">
            {item.userId?.firstName} {item.userId?.lastName}
          </p>
        </div>
      ),
    },
    {
      header: "Return Items",
      key: "items",
      render: (order) => {
        // Filter items that are involved in the return process
        const returnItems = order.items.filter((i) =>
          [
            "Return Requested",
            "Return Approved",
            "Returned",
            "Return Rejected",
          ].includes(i.status)
        );

        if (
          returnItems.length === 0 &&
          order.orderStatus === "Return Requested"
        ) {
          return (
            <span className="text-sm text-gray-500">Entire Order Return</span>
          );
        }
        console.log("returnItems", returnsPayload);
        return (
          <div className="space-y-2">
            {returnItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 text-sm border-b border-gray-100 pb-1 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-gray-500">
                    Size: {item.size}
                  </span>
                  {item.returnReason && (
                    <span className="text-xs text-orange-600 italic">
                      Reason: {item.returnReason}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  {/* Action Buttons Per Item */}
                  {item.status === "Return Requested" && (
                    <>
                      <button
                        onClick={() =>
                          handleAction("approve", order._id, item._id)
                        }
                        title="Approve"
                        className="text-green-600 hover:bg-green-50 p-1 rounded"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleAction("reject", order._id, item._id)
                        }
                        title="Reject"
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  {item.status === "Return Approved" && (
                    <button
                      onClick={() =>
                        handleAction("confirm_receipt", order._id, item._id)
                      }
                      title="Confirm Receipt"
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded flex gap-1 items-center text-xs bg-blue-50 px-2"
                    >
                      <PackageCheck size={14} /> Confirm Rec.
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "Date",
      key: "updatedAt",
      render: (item) => new Date(item.updatedAt).toLocaleDateString("en-IN"),
    },
    {
      header: "View",
      key: "action",
      render: (item) => (
        <button
          onClick={() => navigate(`/admin/orders/${item._id}`)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Return Requests</h1>

      <DynamicTable
        title="Returns"
        columns={columns}
        data={requests}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={confirmAction}
        title={
          modal.type === "approve"
            ? "Approve Return?"
            : modal.type === "reject"
            ? "Reject Return?"
            : "Confirm Receipt & Refund?"
        }
        message={
          modal.type === "approve"
            ? "The user will be notified to ship the item back."
            : modal.type === "reject"
            ? "Please provide a reason for rejection."
            : "Confirming receipt will automatically restock the item and initiate a refund to the user's wallet/source."
        }
        confirmButtonText={
          modal.type === "approve"
            ? "Approve"
            : modal.type === "reject"
            ? "Reject Request"
            : "Confirm & Refund"
        }
        confirmButtonVariant={modal.type === "reject" ? "danger" : "success"}
        isLoading={isApproving || isRejecting || isConfirming}
      >
        {modal.type === "reject" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-black focus:border-black"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this return being rejected?"
            />
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default Inbox;
