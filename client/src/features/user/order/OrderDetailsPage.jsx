import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MapPin,
  CreditCard,
  Phone,
  User,
} from "lucide-react";
import { OrderTimeline } from "./components/OrderTimeline";
import { OrderItem } from "./components/OrderItem";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import InvoiceDownloadButton from "../../../components/user/Buttons";
import { useOrderDetails } from "./orderHooks";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import FeeWarningModal from "./components/FeeWarningModal";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
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

  const { order, isLoading, isError, error, actions, state } =
    useOrderDetails(orderId);

  // Modal State for Cancellation

  if (isLoading) return <LoadingSpinner text="Loading order details..." />;
  if (isError) return <ErrorDisplay error={error} />;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

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
      actions.cancelOrder(cancelReason);
    } else if (cancelModal.type === "item") {
      actions.cancelItem(cancelModal.itemId, cancelReason);
    }
    setCancelModal({ isOpen: false, type: null, itemId: null });
    setCancelReason("");
  };

  return (
    <div>
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderId || order._id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on{" "}
              {new Date(order.timeline.placedAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* Use your reusable Invoice Button */}
          <InvoiceDownloadButton
            order={order}
            variant="default"
            className="border-gray-300 text-gray-700"
          />

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Left Column (Timeline & Items) --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Card */}
          <OrderTimeline timeline={order.timeline} status={order.orderStatus} />

          {/* Items List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">
                Items ({order.items.length})
              </h2>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  order.payment.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                Payment: {order.payment.status}
              </span>
            </div>
            <div>
              {order.items.map((item) => (
                <OrderItem
                  key={item._id}
                  item={item}
                  onCancelItem={(id) => handleCancelClick("item", id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- Right Column (Summary & Address) --- */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" /> Shipping Details
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pinCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                <p className="flex items-center gap-2">
                  <Phone size={14} /> {order.shippingAddress.phone}
                </p>
                <p className="flex items-center gap-2">
                  <User size={14} /> {order.shippingAddress.email}
                </p>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-400" /> Payment Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.price.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="text-green-600">
                  - ₹
                  {(
                    order.price.subtotal - order.price.discountedPrice
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>
                  {order.price.deliveryFee === 0
                    ? "Free"
                    : `₹${order.price.deliveryFee}`}
                </span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{order.price.total.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded text-center">
                  Paid via {order.payment.method}
                </div>
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
    </div>
  );
};

export default OrderDetailsPage;
