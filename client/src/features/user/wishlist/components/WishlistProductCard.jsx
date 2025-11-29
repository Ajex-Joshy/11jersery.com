import React from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { S3_URL } from "../../../../utils/constants";
import { useAddItemToCart } from "../../cart/cartHooks"; // Reusing your cart hook!

const WishlistProductCard = ({ product, onRemove, isRemoving }) => {
  const { mutate: addToCart, isLoading: isAdding } = useAddItemToCart();

  const handleAddToCart = () => {};

  return (
    <div className="group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Area */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Remove Button (Absolute top-right) */}
        <button
          onClick={() => onRemove(product._id)}
          disabled={isRemoving}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
          title="Remove from Wishlist"
        >
          {isRemoving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 mb-4 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price?.sale?.toLocaleString()}
          </span>
          {product.price?.sale < product.price?.list && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.price?.list?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <Link
            to={`/product/${product.slug}`}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart size={16} />
            Select Size
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistProductCard;
