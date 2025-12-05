import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import OrderTimeline from "./components/OrderTimeline";
import { OrderItem } from "./components/OrderItem";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import InvoiceDownloadButton from "../../../components/user/Buttons";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import FeeWarningModal from "./components/FeeWarningModal";
import { useOrderDetails, useRazorpayVerify } from "./orderHooks";
import PriceSummary from "./components/PriceSummary";
import AddressCard from "./components/AddressCard";
import { loadRazorpayScript } from "../../../utils/loadRazorpay";
const _loaded = await loadRazorpayScript();

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // State for input reason (for cancel/return)
  const [actionReason, setActionReason] = useState("");

  // Modal States
  const [feeWarning, setFeeWarning] = useState({
    isOpen: false,
    onProceed: null,
  });

  // Unified Modal State for Cancel AND Return actions
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    action: null, // 'cancel_order', 'cancel_item', 'return_order', 'return_item'
    itemId: null,
  });

  // Fetch data using the custom hook
  const { order, isLoading, isError, error, actions, state, helpers } =
    useOrderDetails(orderId);

  // Timer state for payment retry
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!order?.timeline?.placedAt) return;

    const createdAt = new Date(order.timeline.placedAt).getTime();
    const expiryTime = createdAt + 5 * 60 * 1000; // 5 minutes

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTime - now;
      if (diff <= 0) {
        setRemainingTime(0);
      } else {
        setRemainingTime(Math.floor(diff / 1000));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const { mutate: razorpayVerifyMutation } = useRazorpayVerify();

  if (isLoading) return <LoadingSpinner text="Loading order details..." />;
  if (isError) return <ErrorDisplay error={error} />;
  if (!order) return <div className="p-8 text-center">Order not found</div>;
  const handleRetryPayment = () => {
    const razor = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: order.payment.razorpayOrderId,
      name: "11jersey.com",
      handler: (paymentResult) => {
        console.log("paymentResult", paymentResult);
        razorpayVerifyMutation(
          {
            razorpayOrderId: paymentResult.razorpay_order_id,
            razorpayPaymentId: paymentResult.razorpay_payment_id,
            razorpaySignature: paymentResult.razorpay_signature,
          },
          {
            onSuccess: (finalOrder) => {
              toast.success("Payment successful!");
              navigate(`/order-confirmation/${finalOrder?.data?._id}`);
            },
            onError: () => toast.error("Payment verification failed"),
          }
        );
      },
    });

    razor.open();
  };

  // --- Handler for Action Clicks (Cancel OR Return) ---
  const handleActionClick = (action, itemId = null) => {
    setActionReason(""); // Reset reason input

    // Fee Warning Logic (Only applies to cancellation)
    if (action.startsWith("cancel")) {
      let newTotal = order.price.discountedPrice;

      // Calculate potential new total to check for fee threshold
      if (action === "cancel_item" && itemId) {
        const item = order.items.find((i) => i._id === itemId);
        if (item) newTotal -= item.salePrice * item.quantity;
      } else if (action === "cancel_order") {
        newTotal = 0;
      }

      // If new total drops below 500 (example threshold), show warning
      if (newTotal > 0 && newTotal < 500) {
        setFeeWarning({
          isOpen: true,
          onProceed: () => {
            setFeeWarning({ isOpen: false, onProceed: null });
            setActionModal({ isOpen: true, action, itemId });
          },
        });
        return;
      }
    }

    // Open the main action modal directly
    setActionModal({ isOpen: true, action, itemId });
  };

  // --- Confirm Action Handler ---
  const confirmAction = () => {
    const { action, itemId } = actionModal;

    if (action.startsWith("return") && !actionReason.trim()) {
      toast.error("Please provide a reason to proceed with return.");
      return;
    }

    // Execute the action
    if (action === "cancel_order") actions.cancelOrder(actionReason);
    else if (action === "cancel_item") actions.cancelItem(itemId, actionReason);
    else if (action === "return_order") actions.returnOrder(actionReason);
    else if (action === "return_item") actions.returnItem(itemId, actionReason);

    // Close modal and reset state
    setActionModal({ isOpen: false, action: null, itemId: null });
    setActionReason("");
  };

  // --- Helper to determine modal text based on action type ---
  const isReturn = actionModal.action?.startsWith("return");

  const modalTitle = isReturn
    ? actionModal.action === "return_order"
      ? "Return Entire Order?"
      : "Return Item?"
    : actionModal.action === "cancel_order"
    ? "Cancel Entire Order?"
    : "Cancel Item?";

  const modalMessage = isReturn
    ? "Please confirm you want to return this. Our courier partner will pick it up."
    : "Are you sure you want to cancel? This action cannot be undone.";

  return (
    <div className=" min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
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

          <div className="flex flex-wrap gap-3">
            {/* Invoice Button */}
            <InvoiceDownloadButton
              order={order}
              className="border-gray-300 text-gray-700"
            />

            {/* Cancel Order Button (if eligible) */}
            {state.canCancelOrder && (
              <button
                onClick={() => handleActionClick("cancel_order")}
                disabled={state.isCancelling}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition disabled:opacity-50"
              >
                Cancel Order
              </button>
            )}

            {/* Return Order Button (if eligible) */}
            {state.canReturnOrder && (
              <button
                onClick={() => handleActionClick("return_order")}
                disabled={state.isReturning}
                className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition disabled:opacity-50"
              >
                Return Order
              </button>
            )}

            {/* Retry Payment (if status is initialized) */}
            {order?.orderStatus === "Initialized" && (
              <button
                onClick={handleRetryPayment}
                disabled={remainingTime === 0}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md transition disabled:opacity-50"
              >
                {remainingTime > 0
                  ? `Retry Payment (${Math.floor(remainingTime / 60)}:${String(
                      remainingTime % 60
                    ).padStart(2, "0")})`
                  : "Retry Disabled"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Column (Timeline & Items) --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline Card */}
            <OrderTimeline
              timeline={order.timeline}
              status={order.orderStatus}
            />

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
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
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <OrderItem
                    key={item._id}
                    item={item}
                    // Pass action handlers
                    onCancelItem={(id) => handleActionClick("cancel_item", id)}
                    onReturnItem={(id) => handleActionClick("return_item", id)}
                    // Pass computed eligibility from hook
                    canReturn={helpers.getItemStatus(item).isReturnable}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- Right Column (Summary & Address) --- */}
          <div className="space-y-6">
            <AddressCard address={order.shippingAddress} />
            <PriceSummary price={order.price} />
          </div>
        </div>

        {/* --- Modals --- */}

        {/* Fee Warning Modal (for cancellations below threshold) */}
        <FeeWarningModal
          isOpen={feeWarning.isOpen}
          onClose={() => setFeeWarning({ isOpen: false, onProceed: null })}
          onProceed={feeWarning.onProceed}
        />

        {/* Main Confirmation Modal (for Cancel & Return) */}
        <ConfirmationModal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ ...actionModal, isOpen: false })}
          onConfirm={confirmAction}
          title={modalTitle}
          message={modalMessage}
          confirmButtonText={isReturn ? "Confirm Return" : "Yes, Cancel"}
          confirmButtonVariant={isReturn ? "primary" : "danger"}
          isLoading={
            state.isCancelling ||
            state.isItemCancelling ||
            state.isReturning ||
            state.isItemReturning
          }
        >
          {/* Input Field as Children */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason {isReturn ? "(Required)" : "(Optional)"}
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-black focus:border-black focus:outline-none"
              rows={3}
              placeholder={
                isReturn
                  ? "Why are you returning this? (e.g. Size too small)"
                  : "Why are you cancelling?"
              }
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
          </div>
        </ConfirmationModal>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
