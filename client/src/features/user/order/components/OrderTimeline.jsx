import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Check,
  Package,
  Truck,
  ShoppingBag,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

// Define steps config outside component to prevent recreation on render
const STEPS = [
  { key: "placedAt", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmedAt", label: "Processing", icon: Package },
  { key: "shippedAt", label: "Shipped", icon: Truck },
  { key: "deliveredAt", label: "Delivered", icon: Check },
];

export const OrderTimeline = ({ timeline = {}, status = "Pending" }) => {
  // Calculate status state
  const state = useMemo(() => {
    const isCancelled = status === "Cancelled";
    const isReturned = [
      "Returned",
      "Return Requested",
      "Return Approved",
    ].includes(status);

    let activeIndex = 5;
    switch (status) {
      case "Delivered":
        activeIndex = 4;
        break;
      case "Shipped":
        activeIndex = 3;
        break;
      case "Processing":
        activeIndex = 2;
        break;
      case "Pending":
        activeIndex = 1;
        break;
      default:
        activeIndex = 0;
    }

    return { isCancelled, isReturned, activeIndex };
  }, [status]);

  // Helper to format dates professionally
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render Cancelled/Returned State
  if (state.isCancelled || state.isReturned) {
    const eventDate =
      timeline.cancelledAt || timeline.returnedAt || new Date().toISOString();
    return (
      <div className="w-full p-6 bg-red-50 border border-red-100 rounded-xl flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-red-100 rounded-full shrink-0">
          {state.isCancelled ? (
            <XCircle className="w-6 h-6 text-red-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-900">
            {state.isCancelled ? "Order Cancelled" : `Order ${status}`}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            This order was {state.isCancelled ? "cancelled" : "returned"} on{" "}
            {formatDate(eventDate)}.
          </p>
        </div>
      </div>
    );
  }

  const progressWidth = (state.activeIndex / STEPS.length) * 100;

  return (
    <div className="w-full  mx-auto p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header Information */}
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
          ${
            status === "Delivered"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {status}
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative w-full px-4 md:px-8">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full" />

        {/* 2. Active Progress Line (The "Fill") */}
        <div
          className="absolute top-5 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressWidth}%` }}
        />

        {/* 3. Steps Layout */}
        <div className="flex justify-between items-start w-full">
          {STEPS.map((step, index) => {
            const isCompleted = index <= state.activeIndex - 1;
            const isCurrent = index === state.activeIndex - 1;
            const StepIcon = step.icon;
            const stepDate = timeline[step.key];

            return (
              <div
                key={step.key}
                className="flex flex-col items-center relative group w-24"
              >
                {/* Icon Wrapper */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-4 transition-all duration-500
                    ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg"
                        : "bg-white border-gray-200 text-gray-400"
                    }
                    ${
                      isCurrent && status !== "Delivered"
                        ? "ring-4 ring-emerald-100 scale-110"
                        : ""
                    }
                  `}
                >
                  {isCompleted ? (
                    <StepIcon size={20} strokeWidth={2.5} />
                  ) : (
                    <StepIcon size={20} strokeWidth={1.5} />
                  )}

                  {/* Pulse Effect for Current Step */}
                  {isCurrent && status !== "Delivered" && (
                    <span className="absolute w-full h-full rounded-full bg-emerald-400 opacity-20 animate-ping" />
                  )}
                </div>

                {/* Text Details */}
                <div className="mt-4 flex flex-col items-center text-center">
                  <span
                    className={`text-xs md:text-sm font-bold uppercase tracking-wider mb-1 transition-colors duration-300
                    ${isCompleted ? "text-gray-900" : "text-gray-400"}
                  `}
                  >
                    {step.label}
                  </span>

                  <span className="text-[10px] md:text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                    {new Date(stepDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

OrderTimeline.propTypes = {
  timeline: PropTypes.shape({
    placedAt: PropTypes.string,
    confirmedAt: PropTypes.string,
    shippedAt: PropTypes.string,
    deliveredAt: PropTypes.string,
    cancelledAt: PropTypes.string,
    returnedAt: PropTypes.string,
  }),
  status: PropTypes.string,
};

export default OrderTimeline;
