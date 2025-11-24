import React from "react";
import {
  CheckCircle,
  XCircle,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";

export const OrderItem = ({
  item,
  onCancelItem, // Handler for cancelling this item
  onApproveReturn, // Handler for approving return request
  onRejectReturn, // Handler for rejecting return request
  onConfirmReturn, // Handler for confirming return receipt
}) => {
  // --- Status Styling ---
  const getStatusColor = (s) => {
    if (s === "Delivered") return "text-green-600 bg-green-50 border-green-200";
    if (s === "Cancelled" || s === "Return Rejected")
      return "text-red-600 bg-red-50 border-red-200";
    if (s === "Return Requested")
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (s === "Return Approved")
      return "text-blue-600 bg-blue-50 border-blue-200";
    if (s === "Returned") return "text-gray-600 bg-gray-100 border-gray-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const isCancelled = ["Cancelled", "Returned", "Return Rejected"].includes(
    item.status
  );
  const canCancel = ["Pending", "Processing"].includes(item.status);

  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 last:border-0 items-start relative group">
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
        <img
          src={item.imageUrl}
          alt={item.title}
          className={`w-full h-full object-cover ${
            isCancelled ? "grayscale opacity-60" : ""
          }`}
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p
              className={`font-medium text-sm text-gray-900 line-clamp-1 ${
                isCancelled ? "line-through text-gray-500" : ""
              }`}
            >
              {item.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Size: {item.size} | Qty: {item.quantity}
            </p>
          </div>
          <p className="font-medium text-sm text-gray-900">
            ₹{item.salePrice?.toLocaleString()}
          </p>
        </div>

        {/* Status Badge & Reason */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(
              item.status
            )}`}
          >
            {item.status}
          </span>
          {item.cancelReason && (
            <span
              className="text-[10px] text-gray-400 italic truncate max-w-[200px]"
              title={item.cancelReason}
            >
              Reason: {item.cancelReason}
            </span>
          )}
          {item.returnReason && (
            <span
              className="text-[10px] text-orange-600 italic truncate max-w-[200px]"
              title={item.returnReason}
            >
              Return Reason: {item.returnReason}
            </span>
          )}
        </div>

        {/* --- ADMIN ACTION TOOLBAR --- */}
        <div className="flex items-center gap-2 mt-2">
          {/* 1. Cancel Item (Only if Pending/Processing) */}
          {canCancel && (
            <button
              onClick={() => onCancelItem(item._id)}
              className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition"
            >
              <XCircle size={12} /> Cancel Item
            </button>
          )}

          {/* 2. Return Requested Actions */}
          {item.status === "Return Requested" && (
            <>
              <button
                onClick={() => onApproveReturn(item._id)}
                className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded border border-green-200 transition"
              >
                <CheckCircle size={12} /> Approve Return
              </button>
              <button
                onClick={() => onRejectReturn(item._id)}
                className="flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition"
              >
                <XCircle size={12} /> Reject
              </button>
            </>
          )}

          {/* 3. Confirm Receipt (Only if Return Approved) */}
          {item.status === "Return Approved" && (
            <button
              onClick={() => onConfirmReturn(item._id)}
              className="flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition"
            >
              <PackageCheck size={12} /> Confirm Received
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
