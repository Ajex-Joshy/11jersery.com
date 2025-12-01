import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const OrderItem = ({ item, onCancelItem, onReturnItem, canReturn }) => {
  const isCancelled = [
    "Cancelled",
    "Returned",
    "Return Requested",
    "Return Rejected",
  ].includes(item.status);
  const canCancel = ["Pending", "Processing"].includes(item.status);
  console.log(item.status, canCancel);

  // Simple status color logic
  const getStatusColor = (s) => {
    if (s === "Delivered") return "text-green-600";
    if (s === "Cancelled" || s === "Return Rejected") return "text-red-600";
    if (s === "Return Requested") return "text-orange-600";
    if (s === "Returned" || s === "Return Approved") return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-0">
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

        <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
          <div className="text-xs font-medium">
            <span className={getStatusColor(item.status)}>{item.status}</span>
            {item.status === "Return Rejected" && (
              <span>{` - ${item.returnReason}`}</span>
            )}
          </div>

          <div className="flex gap-3">
            {canCancel && (
              <button
                onClick={() => onCancelItem(item._id)}
                className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
              >
                Cancel Item
              </button>
            )}

            {/* --- NEW RETURN BUTTON --- */}
            {canReturn && (
              <button
                onClick={() => onReturnItem(item._id)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                Return Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

OrderItem.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    salePrice: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onCancelItem: PropTypes.func,
  onReturnItem: PropTypes.func,
  canReturn: PropTypes.bool,
};

export default OrderItem;
