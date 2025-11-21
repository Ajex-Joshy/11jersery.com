import React from "react";
import {
  Check,
  Package,
  Truck,
  ShoppingBag,
  XCircle,
  RotateCcw,
} from "lucide-react";

const steps = [
  { key: "placedAt", label: "Ordered", icon: ShoppingBag },
  { key: "confirmedAt", label: "Packed", icon: Package },
  { key: "shippedAt", label: "Shipped", icon: Truck },
  { key: "deliveredAt", label: "Delivered", icon: Check },
];

export const OrderTimeline = ({ timeline, status }) => {
  const isCancelled = status === "Cancelled";
  const isReturned =
    status === "Returned" ||
    status === "Return Requested" ||
    status === "Return Approved";

  // Determine the index of the latest completed step
  let currentStepIndex = -1;
  if (timeline.deliveredAt) currentStepIndex = 3;
  else if (timeline.shippedAt) currentStepIndex = 2;
  else if (timeline.confirmedAt) currentStepIndex = 1;
  else if (timeline.placedAt) currentStepIndex = 0;

  // Handle Cancelled/Returned state explicitly
  if (isCancelled || isReturned) {
    const date = new Date(
      timeline.cancelledAt || timeline.returnedAt || Date.now()
    );
    return (
      <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
        <div className="p-3 bg-red-100 rounded-full text-red-600">
          {isCancelled ? <XCircle size={24} /> : <RotateCcw size={24} />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-700">
            {isCancelled ? "Order Cancelled" : `Order ${status}`}
          </h3>
          <p className="text-sm text-red-600">
            On{" "}
            {date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between items-center">
        {/* --- Background Line --- */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />

        {/* --- Active Progress Line --- */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* --- Steps --- */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const date = timeline[step.key];
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative group"
            >
              {/* Dot / Icon Circle */}
              <div
                className={`
                  w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10
                  ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white shadow-md scale-100"
                      : "bg-white border-gray-200 text-gray-300"
                  }
                  ${
                    isCurrent && !timeline.deliveredAt
                      ? "ring-4 ring-green-100"
                      : ""
                  } 
                `}
              >
                {/* Show checkmark for past steps, Icon for current/future */}
                {index < currentStepIndex ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <Icon size={16} strokeWidth={2} />
                )}
              </div>

              {/* Label & Date */}
              <div className="absolute top-12 flex flex-col items-center w-32 text-center">
                <span
                  className={`text-xs md:text-sm font-semibold transition-colors duration-300 ${
                    isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>

                {/* Date Logic */}
                {date ? (
                  <span className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
                    {new Date(date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                ) : (
                  /* Show "Expected" for future steps if previous step is done */
                  index === currentStepIndex + 1 && (
                    <span className="text-[10px] md:text-xs text-green-600 font-medium mt-0.5">
                      Expected by{" "}
                      {new Date(Date.now() + 86400000 * 3).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" }
                      )}
                    </span>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacer for text below dots */}
      <div className="h-12" />
    </div>
  );
};
