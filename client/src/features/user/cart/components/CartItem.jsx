import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Trash2, Loader2 } from "lucide-react";
import QuantitySpinner from "./QuantitySpinner";
import { formatRupee } from "../../../../utils/currency";

const CartItem = ({ item, onIncrement, onDecrement, onRemove, isMutating }) => {
  if (!item) {
    // Handle cases where product might not be populated (e.g., deleted product)
    return (
      <div className="flex gap-4 p-4 border border-gray-200 rounded-lg items-center justify-between text-red-500">
        <span>This item (ID: {item._id}) is no longer available.</span>
        <button
          onClick={() => onRemove(item._id)}
          className="p-2 hover:bg-red-50 rounded-full"
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  }

  const imageUrl = item?.imageUrl;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg">
      {/* Image */}
      <Link
        to={`/product/${item?.slug}`}
        className="w-full sm:w-28 h-28 shrink-0"
      >
        <img
          src={imageUrl}
          alt={item?.title}
          className="w-full h-full object-cover rounded-md bg-gray-100"
          onError={(e) => {
            e.target.src =
              "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg";
          }}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/product/${item?.slug}`}
            className="text-md font-semibold text-gray-900 hover:underline"
          >
            {item?.title}
          </Link>
          <p className="text-sm text-gray-500">Size: {item.size}</p>
        </div>
        <span className="text-md font-bold text-gray-800 mt-2 sm:mt-0">
          {formatRupee(item?.salePrice)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex sm:flex-col justify-between sm:justify-start items-end sm:items-end gap-2">
        <button
          onClick={() => onRemove(item._id)}
          disabled={isMutating}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50"
        >
          {isMutating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
        <QuantitySpinner
          value={item.quantity}
          onDecrease={() => onDecrement(item)}
          onIncrease={() => onIncrement(item)}
          isLoading={false}
          // maxQuantity={product.stock} // Pass stock if available
        />
      </div>
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    salePrice: PropTypes.number.isRequired,
  }).isRequired,
  onIncrement: PropTypes.func,
  onDecrement: PropTypes.func,
  onRemove: PropTypes.func,
  isMutating: PropTypes.bool,
};

export default CartItem;
