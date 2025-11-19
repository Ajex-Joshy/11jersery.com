import React from "react";
import { Link } from "react-router-dom";
import { Plus, Minus, Trash2, Loader2 } from "lucide-react";

/**
 * A reusable spinner for quantity controls.
 */
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

/**
 * A single item row in the cart list.
 */
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

  // Get image (use cover image - index 0)
  const imageUrl = item.productDetails.imageUrl;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg">
      {/* Image */}
      <Link
        to={`/product/${item?.productDetails?.slug}`}
        className="w-full sm:w-28 h-28 flex-shrink-0"
      >
        <img
          src={imageUrl}
          alt={item?.productDetails?.title}
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
            to={`/product/${item?.productDetails?.slug}`}
            className="text-md font-semibold text-gray-900 hover:underline"
          >
            {item?.productDetails?.title}
          </Link>
          <p className="text-sm text-gray-500">Size: {item.size}</p>
        </div>
        <span className="text-md font-bold text-gray-800 mt-2 sm:mt-0">
          ₹{item.price.toLocaleString()}
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
          isLoading={isMutating}
          // maxQuantity={product.stock} // Pass stock if available
        />
      </div>
    </div>
  );
};

/**
 * The list of cart items. Reusable in cart page, checkout, etc.
 */
export const CartProductList = ({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  mutatingItemId,
}) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={item._id}
          item={item}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onRemove={onRemove}
          isMutating={mutatingItemId === item._id} // Pass down if this specific item is loading
        />
      ))}
    </div>
  );
};

/**
 * Skeleton loader for the cart list.
 */
export const CartProductListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
        <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-10 bg-gray-200 rounded-md"></div>
      </div>
    ))}
  </div>
);
