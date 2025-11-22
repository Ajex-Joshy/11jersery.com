import React from "react";
import { Link } from "react-router-dom";
import { S3_URL } from "../../../../utils/constants";
export const OrderItem = ({ item, onCancelItem }) => {
  const isCancelled =
    item.status === "Cancelled" ||
    item.status === "Returned" ||
    item.status === "Return Requested";

  // Determine actions available for this specific item
  // This logic assumes you have a handler passed down to cancel individual items
  const canCancel = item.status === "Pending" || item.status === "Processing";

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
        <img
          src={item.imageUrl}
          alt={item.title}
          className={`w-full h-full object-cover ${
            isCancelled ? "grayscale opacity-70" : ""
          }`}
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
        />
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <Link
              to={`/product/${item.slug}`}
              className={`font-semibold text-gray-900 hover:underline line-clamp-1 ${
                isCancelled ? "text-gray-500 line-through" : ""
              }`}
            >
              {item.title}
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              Size: {item.size} | Qty: {item.quantity}
            </p>
          </div>
          <p className="font-medium text-gray-900">
            ₹{item.salePrice.toLocaleString()}
          </p>
        </div>

        {/* Item Status & Actions */}
        <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
          <div className="text-xs">
            <span
              className={`font-medium ${
                item.status === "Delivered"
                  ? "text-green-600"
                  : item.status === "Cancelled"
                  ? "text-red-600"
                  : item.status === "Return Requested"
                  ? "text-orange-600"
                  : "text-blue-600"
              }`}
            >
              {item.status}
            </span>
            {item.cancelReason && (
              <span className="text-gray-400 ml-2">- {item.cancelReason}</span>
            )}
          </div>

          {canCancel && (
            <button
              onClick={() => onCancelItem(item._id)}
              className="text-xs text-red-600 hover:text-red-800 hover:underline"
            >
              Cancel Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
