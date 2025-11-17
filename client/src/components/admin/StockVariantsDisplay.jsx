import React from "react";
import PropTypes from "prop-types";

const sizeColorMap = {
  XS: "bg-yellow-400 text-yellow-900",
  S: "bg-green-400 text-green-900",
  M: "bg-blue-400 text-blue-900",
  L: "bg-purple-400 text-purple-900",
  XL: "bg-pink-400 text-pink-900",
  XXL: "bg-gray-400 text-gray-900",
};

const StockVariantsDisplay = ({ variants }) => {
  if (!variants || variants.length === 0) {
    return <span className="text-gray-500 text-xs">No variants</span>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {variants.map((variant) => (
        <div
          key={variant._id || variant.sku}
          className="flex items-center gap-1 border border-gray-200 rounded px-1.5 py-0.5"
        >
          <span
            className={`text-[10px] font-bold px-1 rounded ${
              sizeColorMap[variant.size] || "bg-gray-200 text-gray-800"
            }`}
          >
            {variant.size}
          </span>
          <span className="text-xs text-gray-600">{variant.stock}</span>
        </div>
      ))}
    </div>
  );
};

StockVariantsDisplay.propTypes = {
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      sku: PropTypes.string,
      size: PropTypes.string.isRequired,
      stock: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default StockVariantsDisplay;
