import React, { useState } from "react";
import { Minus, Plus, Heart } from "lucide-react";
import StarRating from "../../../../components/common/StarRating";
import toast from "react-hot-toast";

const ProductPurchaseForm = ({ product }) => {
  const { title, rating, shortDescription, price, variants } = product;

  // State for user selections
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Create a map for quick stock lookup
  const stockMap = new Map(variants.map((v) => [v.size, v.stock]));

  // Calculate discount
  const hasDiscount = price.sale < price.list;
  const discountPercentage = hasDiscount
    ? Math.round(((price.list - price.sale) / price.list) * 100)
    : 0;

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1); // Reset quantity when size changes
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount)); // Ensure quantity is at least 1
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size."); // Use toast for feedback
      return;
    }
    // Add to cart logic here (e.g., dispatch to Redux or call context)
    console.log(`Adding ${quantity} of size ${selectedSize} to cart.`);
    toast.success("Added to cart!");
  };

  // Check stock for the *selected* size
  const selectedStock = stockMap.get(selectedSize) || 0;
  const isOutOfStock = selectedSize && selectedStock === 0;
  const isAddToCartDisabled =
    !selectedSize || isOutOfStock || quantity > selectedStock;

  return (
    <div className="flex flex-col space-y-5">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>

      {/* Price & Rating */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{price.sale.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">
              ₹{price.list.toLocaleString()}
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
        <span className="text-sm font-semibold text-gray-700 mb-2 block">
          Choose Size
        </span>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isAvailable = variant.stock > 0;
            const isSelected = selectedSize === variant.size;
            return (
              <button
                key={variant.sku}
                onClick={() => handleSizeSelect(variant.size)}
                disabled={!isAvailable}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium border
                  ${
                    isSelected
                      ? "bg-black text-white border-black" // Selected style
                      : "bg-white text-gray-700 border-gray-300" // Default style
                  }
                  ${
                    isAvailable
                      ? "hover:border-black cursor-pointer" // Available
                      : "opacity-50 cursor-not-allowed bg-gray-100 line-through" // Out of stock
                  }
                `}
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
          className="flex-grow bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
        {/* Wishlist */}
        <button className="px-3 py-3 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 hover:text-red-500 transition-colors">
          <Heart size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductPurchaseForm;
