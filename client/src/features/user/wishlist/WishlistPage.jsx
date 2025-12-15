import React, { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist, useToggleWishlist } from "./wishlistHooks"; // Adjust path
import WishlistProductCard from "./components/WishlistProductCard"; // Adjust path
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../account/authSlice";
const WishlistPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const {
    data: wishlistPayload,
    isLoading,
    isError,
    error,
  } = useWishlist({ enabled: isAuthenticated || false });
  const { mutate: toggleWishlist, isLoading: isToggling } = useToggleWishlist();

  // Track which item is being removed to show spinner on specific card
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = (productId) => {
    setRemovingId(productId);
    toggleWishlist(productId, {
      onSettled: () => setRemovingId(null),
    });
  };

  if (isLoading) return <LoadingSpinner text="Loading wishlist..." />;
  if (isError) return <ErrorDisplay error={error} />;

  const wishlist = wishlistPayload?.payload || { products: [] };
  const products = wishlist.products || [];

  // Empty State
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Heart size={40} className="text-gray-300" fill="none" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't found the perfect jersey yet. Explore our
          collections to find your match.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
        >
          <ShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-3 mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <span className="text-lg text-gray-500 font-medium mb-1">
          ({products.length} items)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <WishlistProductCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            isRemoving={isToggling && removingId === product._id}
          />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
