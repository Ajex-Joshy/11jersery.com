import PropTypes from "prop-types";
import { Minus, Plus, Loader2 } from "lucide-react";

const QuantitySpinner = ({
  value,
  onDecrease,
  onIncrease,
  isLoading,
  maxQuantity,
}) => (
  <div className="flex items-center border border-gray-300 rounded-md">
    <button
      onClick={onDecrease}
      disabled={isLoading || value <= 1} // Disable if at 1 or loading
      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-md disabled:opacity-50"
    >
      <Minus size={16} />
    </button>
    <span className="px-5 text-md font-semibold w-16 text-center">
      {isLoading ? (
        <Loader2 size={16} className="animate-spin mx-auto" />
      ) : (
        value
      )}
    </span>
    <button
      onClick={onIncrease}
      disabled={isLoading || (maxQuantity && value >= maxQuantity)} // Disable if at stock limit or loading
      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-md disabled:opacity-50"
    >
      <Plus size={16} />
    </button>
  </div>
);

QuantitySpinner.propTypes = {
  value: PropTypes.number.isRequired,
  onDecrease: PropTypes.func.isRequired,
  onIncrease: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  maxQuantity: PropTypes.number,
};

export default QuantitySpinner;
