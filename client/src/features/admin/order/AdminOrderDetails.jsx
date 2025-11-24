import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, AlertTriangle, X, Info, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

import {
  useAdminOrderDetails,
  useApproveReturn,
  useConfirmReturnReceived,
  useRejectReturn,
} from "./orderHooks";
import axiosInstance from "../../../api/axiosInstance";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import StatusBadge from "./components/StatusBadge";
import OrderTimeline from "../../user/order/components/OrderTimeline";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import FeeWarningModal from "../../user/order/components/FeeWarningModal";
import OrderItem from "./components/orderItem";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- State ---
  const [newStatus, setNewStatus] = useState("");
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Modal States
  const [cancelReason, setCancelReason] = useState("");
  const [feeWarning, setFeeWarning] = useState({
    isOpen: false,
    onProceed: null,
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    type: null,
    itemId: null,
  });

  // --- Queries ---
  const { order, isLoading, isError, error, actions, state } =
    useAdminOrderDetails(orderId);

  const handleCancelClick = (type, itemId = null) => {
    let newTotal = order.price.discountedPrice;

    if (type === "item" && itemId) {
      const itemToCancel = order.items.find((item) => item._id === itemId);
      if (itemToCancel) {
        newTotal -= itemToCancel.salePrice * itemToCancel.quantity;
      }
    } else if (type === "order") {
      newTotal = 0;
    }

    if (newTotal > 0 && newTotal < 500) {
      setFeeWarning({
        isOpen: true,
        onProceed: () => {
          setFeeWarning({ isOpen: false, onProceed: null });
          setCancelModal({ isOpen: true, type, itemId });
        },
      });
      return;
    }

    setCancelModal({ isOpen: true, type, itemId });
  };

  const confirmCancel = () => {
    if (cancelModal.type === "order") {
      actions.cancelOrder(order.userId, cancelReason);
    } else if (cancelModal.type === "item") {
      actions.cancelItem(order.userId, cancelModal.itemId, cancelReason);
    }
    setCancelModal({ isOpen: false, type: null, itemId: null });
    setCancelReason("");
  };
  // Inside AdminOrderDetails.jsx

  // --- Return/Action Handlers ---
  const approveReturnMutation = useApproveReturn();
  const rejectReturnMutation = useRejectReturn();
  const confirmReturnMutation = useConfirmReturnReceived();

  // --- Unified Action Modal Handler ---
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // "cancel_order" | "cancel_item" | "approve_return" | "reject_return" | "confirm_return"
    itemId: null,
  });
  const [actionReason, setActionReason] = useState("");

  const handleActionModal = (type, itemId = null) => {
    setActionModal({ isOpen: true, type, itemId });
    setActionReason("");
  };

  const confirmActionModal = () => {
    const { type, itemId } = actionModal;
    if (!order) return;

    switch (type) {
      case "cancel_order":
        actions.cancelOrder(order.userId, actionReason);
        break;
      case "cancel_item":
        actions.cancelItem(order.userId, itemId, actionReason);
        break;
      case "approve_return":
        approveReturnMutation.mutate({ orderId, itemId });
        break;
      case "reject_return":
        rejectReturnMutation.mutate({ orderId, itemId, reason: actionReason });
        break;
      case "confirm_return":
        confirmReturnMutation.mutate({ orderId, itemId });
        break;
      default:
        console.warn("Unknown action:", type);
        break;
    }

    setActionModal({ isOpen: false, type: null, itemId: null });
    setActionReason("");
  };

  // 1. Update Order Status
  const { mutate: updateStatus, isLoading: isUpdating } = useMutation({
    mutationFn: async ({ status }) => {
      await axiosInstance.patch(`/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries(["adminOrders", orderId]);
      setIsEditingStatus(false);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.error?.message || "Failed to update status"
      ),
  });

  // --- Handlers ---

  const handleSaveStatus = () => {
    if (newStatus && newStatus !== order.orderStatus) {
      updateStatus({ status: newStatus });
    } else {
      setIsEditingStatus(false);
    }
  };

  // --- Render ---

  if (isLoading) return <LoadingSpinner text="Loading order details..." />;
  if (isError) return <ErrorDisplay error={error} />;
  if (!order)
    return <div className="p-8 text-center text-gray-500">Order not found</div>;

  const statusOptions = ["Pending", "Processing", "Shipped", "Delivered"];

  const canCancel = ["Pending", "Processing", "Placed"].includes(
    order.orderStatus
  );

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Order #{order.orderId || order._id?.slice(-6).toUpperCase()}
              <StatusBadge status={order.orderStatus} />
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 items-center">
          {isEditingStatus ? (
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
              <select
                value={newStatus || order.orderStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="text-sm border-none focus:ring-0 py-1 pl-2 pr-8 bg-transparent"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSaveStatus}
                disabled={isUpdating}
                className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                <Save size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingStatus(true)}
              disabled={["Cancelled", "Delivered", "Returned"].includes(
                order.orderStatus
              )}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Change Status
            </button>
          )}

          {/* Cancel Order Button */}
          {state.canCancelOrder && (
            <button
              onClick={() => handleCancelClick("order")}
              disabled={state.isCancelling}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <OrderTimeline
              timeline={order.timeline}
              status={order.orderStatus}
            />
          </div>

          {/* Items List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">
                Items ({order.items.length})
              </h2>
            </div>
            {order.items.map((item) => (
              <OrderItem
                key={item._id}
                item={item}
                onCancelItem={(id) => handleCancelClick("item", id)}
                onApproveReturn={(id) =>
                  handleActionModal("approve_return", id)
                }
                onRejectReturn={(id) => handleActionModal("reject_return", id)}
                onConfirmReturn={(id) =>
                  handleActionModal("confirm_return", id)
                }
              />
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {order.shippingAddress?.firstName?.[0] || "U"}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress?.firstName}{" "}
                  {order.shippingAddress?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {order.userId?.slice(-6) || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex justify-between">
                <span>Email:</span>{" "}
                <span className="font-medium text-gray-900">
                  {order.shippingAddress?.email}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Phone:</span>{" "}
                <span className="font-medium text-gray-900">
                  {order.shippingAddress?.phone}
                </span>
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <address className="not-italic text-sm text-gray-600 leading-relaxed">
              {order.shippingAddress?.addressLine1}
              <br />
              {order.shippingAddress?.addressLine2 && (
                <>
                  {order.shippingAddress.addressLine2}
                  <br />
                </>
              )}
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
              <br />
              {order.shippingAddress?.country} -{" "}
              {order.shippingAddress?.pinCode}
            </address>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">
                  {order.payment?.method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${
                    order.payment?.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.payment?.status}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-base text-gray-900">
                <span>Total Amount</span>
                <span>₹{order.price?.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Cancellation */}
      <FeeWarningModal
        isOpen={feeWarning.isOpen}
        onClose={() => setFeeWarning({ isOpen: false, onProceed: null })}
        onProceed={feeWarning.onProceed}
      />
      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ ...cancelModal, isOpen: false })}
        onConfirm={confirmCancel}
        title={
          cancelModal.type === "order" ? "Cancel Entire Order?" : "Cancel Item?"
        }
        message={
          cancelModal.type === "order"
            ? "Are you sure you want to cancel this order? This action cannot be undone."
            : "Are you sure you want to cancel this specific item?"
        }
        confirmButtonText="Yes, Cancel"
        confirmButtonVariant="danger"
        isLoading={state.isCancelling || state.isItemCancelling}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason (Optional)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-black focus:border-black"
            rows={3}
            placeholder="Why are you cancelling?"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </ConfirmationModal>

      {/* Unified Action Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ ...actionModal, isOpen: false })}
        onConfirm={confirmActionModal}
        title={
          actionModal.type === "cancel_order"
            ? "Cancel Entire Order?"
            : actionModal.type === "cancel_item"
            ? "Cancel Item?"
            : actionModal.type === "approve_return"
            ? "Approve Return?"
            : actionModal.type === "reject_return"
            ? "Reject Return?"
            : "Confirm Receipt & Refund?"
        }
        message={
          actionModal.type === "cancel_order" ||
          actionModal.type === "cancel_item"
            ? "Are you sure you want to cancel this?"
            : actionModal.type === "approve_return"
            ? "The user will be notified to ship the item back."
            : actionModal.type === "reject_return"
            ? "Please provide a reason for rejection."
            : "Confirming receipt will automatically restock the item and refund the user."
        }
        confirmButtonText={
          actionModal.type === "cancel_order" ||
          actionModal.type === "cancel_item"
            ? "Yes, Cancel"
            : actionModal.type === "approve_return"
            ? "Approve"
            : actionModal.type === "reject_return"
            ? "Reject Request"
            : "Confirm & Refund"
        }
        confirmButtonVariant={
          actionModal.type === "cancel_order" ||
          actionModal.type === "cancel_item" ||
          actionModal.type === "reject_return"
            ? "danger"
            : "success"
        }
        isLoading={state.isCancelling || state.isItemCancelling}
      >
        {(actionModal.type === "cancel_order" ||
          actionModal.type === "cancel_item" ||
          actionModal.type === "reject_return") && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-black focus:border-black"
              rows={3}
              placeholder="Provide reason..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default AdminOrderDetails;
