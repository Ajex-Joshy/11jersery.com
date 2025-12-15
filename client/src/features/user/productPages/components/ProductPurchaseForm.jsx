import React, { useState, useEffect, useMemo } from "react";
import { Minus, Plus, Heart } from "lucide-react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import StarRating from "../../../../components/common/StarRating";

// We only need the Cart getter and the Add/Update hook now
import { useAddItemToCart, useCart } from "../../cart/cartHooks";
import { MAX_QUANTITY_PER_ORDER } from "../../../../utils/constants";
import { useToggleWishlist, useWishlist } from "../../wishlist/wishlistHooks";
import { formatRupee } from "../../../../utils/currency";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../account/authSlice";

const ProductPurchaseForm = ({ product, onOpenSizeGuide }) => {
  const { title, rating, shortDescription, price, variants } = product;
  const isAurhenticated = useSelector(selectIsAuthenticated);

  // State for user selections
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // API Hooks
  const { mutate: addItemToCart, isPending } = useAddItemToCart();
  const { data: cart } = useCart({ enabled: isAurhenticated || false });

  const { mutate: toggleWishlist, isLoading: isTogglingWishlist } =
    useToggleWishlist();
  const { data: wishlistPayload, isLoading: isWishlistLoading } = useWishlist({
    enabled: isAurhenticated || false,
  });

  const isInWishlist = useMemo(() => {
    const wishlistItems = wishlistPayload?.payload?.products || [];
    return wishlistItems.some((item) => item._id === product._id);
  }, [wishlistPayload, product._id]);

  // Create a map for quick stock lookup
  const stockMap = new Map((variants || []).map((v) => [v.size, v.stock]));
  const selectedStock = stockMap.get(selectedSize) || 0;

  // 1. SYNC WITH CART: If item exists in cart, sync local quantity to that value on load
  useEffect(() => {
    if (!selectedSize || !cart?.data?.items) return;

    const existingItem =
      cart.data.items.find(
        (item) => item.productId === product._id && item.size === selectedSize
      ) || null;

    if (existingItem) {
      setQuantity(existingItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [cart, selectedSize, product._id]);

  // 2. LOCAL ONLY: Update state without API calls
  const handleQuantityChange = (amount) => {
    if (!selectedSize) {
      toast.dismiss();
      toast.error("Please select a size.");
      return;
    }

    setQuantity((prevQty) => {
      const newQty = prevQty + amount;

      if (newQty > MAX_QUANTITY_PER_ORDER) {
        toast.dismiss();
        toast.error("Maximum quantity per order is 20");
        return prevQty;
      }

      if (newQty < 1) return 1;

      if (newQty > selectedStock) {
        toast.error(`Only ${selectedStock} items available`);
        return prevQty;
      }

      return newQty;
    });
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (quantity > MAX_QUANTITY_PER_ORDER) {
      toast.error(`Maximum quantity per item is ${MAX_QUANTITY_PER_ORDER}`);
      return;
    }

    const payload = {
      productId: product._id,
      size: selectedSize,
      quantity: quantity,
    };

    addItemToCart(payload, {
      onSuccess: () => {
        // Check if item was already in cart to customize message
        const existingItem = cart?.data?.items?.find(
          (item) => item.productId === product._id && item.size === selectedSize
        );

        if (existingItem) {
          toast.success("Cart updated successfully!");
        } else {
          toast.success("Added to cart!");
        }
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to add to cart");
      },
    });
  };
  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product._id);
    }
  };

  // Calculation helpers
  const hasDiscount = price.sale < price.list;
  const discountPercentage = hasDiscount
    ? Math.round(((price.list - price.sale) / price.list) * 100)
    : 0;

  const isOutOfStock = selectedSize && selectedStock === 0;
  const isAddToCartDisabled =
    !selectedSize ||
    isOutOfStock ||
    quantity > selectedStock ||
    quantity > MAX_QUANTITY_PER_ORDER ||
    isPending;

  return (
    <div className="flex flex-col space-y-5">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>

      {/* Price & Rating */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatRupee(price.sale)}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">
              {formatRupee(price.list)}
            </span>
          )}
          {hasDiscount && (
            <span className="text-sm font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-md">
              -{discountPercentage}%
            </span>
          )}
        </div>
        <div className="border-l border-gray-300 pl-4 flex items-center gap-1">
          <StarRating rating={rating.average} size={16} />
          <span className="text-sm text-gray-600">
            ({rating.average.toFixed(1)}/5)
          </span>
        </div>
      </div>

      {/* Short Description */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {shortDescription}
      </p>

      {/* Size Selector */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Choose Size
          </span>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            See size guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(variants || []).map((variant) => {
            const isAvailable = variant.stock > 0;
            const isSelected = selectedSize === variant.size;
            return (
              <button
                key={variant.sku}
                onClick={() => handleSizeSelect(variant.size)}
                disabled={!isAvailable}
                className={`px-4 py-2 rounded-md text-sm font-medium border ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                } ${
                  isAvailable
                    ? "hover:border-black cursor-pointer"
                    : "opacity-50 cursor-not-allowed bg-gray-100 line-through"
                }`}
              >
                {variant.size}
              </button>
            );
          })}
        </div>
        {selectedSize && selectedStock > 0 && selectedStock <= 10 && (
          <p className="text-xs text-red-600 mt-2">
            Hurry! Only {selectedStock} left in stock.
          </p>
        )}
        {isOutOfStock && (
          <p className="text-xs text-red-600 mt-2">
            This size is out of stock.
          </p>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="flex items-stretch gap-4 pt-2">
        {/* Quantity */}
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-l-md disabled:opacity-50"
          >
            <Minus size={16} />
          </button>
          <span className="px-5 text-md font-semibold">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={selectedSize && quantity >= selectedStock}
            className="px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-r-md disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className="grow bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isPending
            ? "Processing..."
            : isOutOfStock
            ? "Out of Stock"
            : "Add to Cart"}
        </button>

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist || isWishlistLoading}
          className={`
            px-3 py-3 border rounded-md transition-colors flex items-center justify-center
            ${
              isInWishlist
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100" // Active Style
                : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-red-500" // Inactive Style
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {/* Fill the heart if active */}
          <Heart
            size={20}
            fill={isInWishlist ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
};

ProductPurchaseForm.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    rating: PropTypes.shape({
      average: PropTypes.number.isRequired,
    }).isRequired,
    shortDescription: PropTypes.string,
    price: PropTypes.shape({
      list: PropTypes.number.isRequired,
      sale: PropTypes.number.isRequired,
    }).isRequired,
    variants: PropTypes.arrayOf(
      PropTypes.shape({
        sku: PropTypes.string.isRequired,
        size: PropTypes.string.isRequired,
        stock: PropTypes.number.isRequired,
      })
    ),
  }).isRequired,
  onOpenSizeGuide: PropTypes.func.isRequired,
};

export default ProductPurchaseForm;
