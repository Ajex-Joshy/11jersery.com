import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Badge for customer status (Active / Blocked)
 */
export const StatusBadge = ({ status, isBlocked }) => {
  let text, bgColor, textColor;

  if (isBlocked) {
    text = "Blocked";
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  } else if (status === "active") {
    text = "Active";
    bgColor = "bg-green-100";
    textColor = "text-green-700";
  } else {
    text = "Inactive";
    bgColor = "bg-gray-100";
    textColor = "text-gray-700";
  }

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      <span
        className="w-2 h-2 mr-2 rounded-full"
        style={{ backgroundColor: textColor.replace("text-", "") }}
      />
      {text}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  isBlocked: PropTypes.bool.isRequired,
};

/**
 * Badge/Button for category status (List / Unlist)
 * We can make this a button to handle your toggle logic.
 */
export const ListToggleButton = ({ isListed, onClick, isLoading }) => {
  const text = isListed ? "UNLIST" : "LIST";
  const styles = isListed
    ? "bg-red-500 text-white hover:bg-red-600"
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button
      onClick={onClick}
      // Disable the button while the mutation is in progress
      disabled={isLoading}
      className={`px-4 py-2 rounded text-xs font-bold transition-colors ${styles} disabled:bg-gray-400 disabled:cursor-not-allowed`}
    >
      {isLoading ? "SAVING..." : text}
    </button>
  );
};
ListToggleButton.propTypes = {
  isListed: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

/**
 * Action button for (Block / Unblock)
 */
export const ActionToggleButton = ({ isBlocked, onClick, isLoading }) => {
  const text = isBlocked ? "UNBLOCK" : "BLOCK";
  const styles = isBlocked
    ? "bg-red-500 text-white hover:bg-red-600"
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button
      onClick={onClick}
      // Disable the button while the mutation is in progress
      disabled={isLoading}
      className={`px-4 py-2 rounded text-xs font-bold transition-colors ${styles} disabled:bg-gray-400 disabled:cursor-not-allowed`}
    >
      {isLoading ? "SAVING..." : text}
    </button>
  );
};

/**
 * Icon buttons for (Edit / Delete)
 */
export const ActionIconButtons = ({ onEdit, onDelete }) => (
  <div className="flex gap-3">
    <button onClick={onEdit} className="text-gray-500 hover:text-green-600">
      <Edit2 className="w-4 h-4" />
    </button>
    <button onClick={onDelete} className="text-gray-500 hover:text-red-600">
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

ActionToggleButton.propTypes = {
  isBlocked: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
