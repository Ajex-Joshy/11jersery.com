import React from "react";
import PropTypes from "prop-types";

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Returned: "bg-gray-100 text-gray-800",
  "Return Requested": "bg-orange-100 text-orange-800",
  "Return Approved": "bg-teal-100 text-teal-800",
  "Return Rejected": "bg-red-50 text-red-600",
};

const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};
