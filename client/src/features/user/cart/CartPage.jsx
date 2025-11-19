import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ChevronRight, Loader2, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

import {
  useCart,
  useIncrementItem,
  useDecrementItem,
  useRemoveItemFromCart,
  useClearCart,
} from "./cartHooks";

import { CartProductList } from "./components/CartProductList";
import { OrderSummary } from "../../../components/user/OrderSummary";
import { ErrorDisplay } from "../../../components/common/StateDisplays";

const CartPage = () => {
  const navigate = useNavigate();

  const { data: cartPayload, isLoading, isError, error } = useCart();
  console.log(cartPayload);

  const [mutatingItemId, setMutatingItemId] = useState(null);

  const { mutate: incrementMutate, isLoading: isIncrementing } =
    useIncrementItem();
  const { mutate: decrementMutate, isLoading: isDecrementing } =
    useDecrementItem();
  const { mutate: removeMutate, isLoading: isRemoving } =
    useRemoveItemFromCart();
  const { mutate: clearMutate, isLoading: isClearing } = useClearCart();

  // 4. Handler Functions (to pass down as props)
  const createMutationOptions = (itemId) => ({
    onSuccess: () => setMutatingItemId(null),
    onError: (err) => {
      toast.error(err.response?.data?.message || "An error occurred");
      setMutatingItemId(null);
    },
  });

  const handleIncrement = (item) => {
    // Optional: Add stock check here if `item.productId.variants` is available
    setMutatingItemId(item._id);
    incrementMutate({ itemId: item._id }, createMutationOptions(item._id));
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      setMutatingItemId(item._id);
      console.log(item._id);
      decrementMutate({ itemId: item._id }, createMutationOptions(item._id));
    } else {
      // If quantity is 1, decrementing should trigger a remove
      handleRemove(item._id);
    }
  };

  const handleRemove = (itemId) => {
    console.log("handleRemoveItemId", itemId);
    setMutatingItemId(itemId);
    removeMutate(itemId, createMutationOptions(itemId));
  };

  const handleClearCart = () => {
    clearMutate(undefined, {
      // No payload needed
      onSuccess: () => toast.success("Cart cleared"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Failed to clear cart"),
    });
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  // 5. Render Logic
  if (isLoading) {
    return <CartPageSkeleton />; // Show a loading skeleton
  }

  if (isError) {
    return <ErrorDisplay error={error} />;
  }

  const cart = cartPayload?.data || {};
  const items = cart.items || [];

  // Empty Cart View
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart
          size={64}
          className="mx-auto text-gray-300"
          strokeWidth={1}
        />
        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mb-6">
          Looks like you haven't added any jerseys yet.
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Main Cart View
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm flex items-center gap-2 text-gray-500">
          <Link to="/" className="hover:text-gray-900">
            <Home size={14} />
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-700">Cart</span>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your cart</h1>
          <button
            onClick={handleClearCart}
            disabled={isClearing}
            className="text-sm font-medium text-gray-500 hover:text-red-600 hover:underline disabled:opacity-50"
          >
            {isClearing ? "Clearing..." : "Clear Cart"}
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Product List */}
          <div className="lg:col-span-2 space-y-6">
            <CartProductList
              items={items}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
              mutatingItemId={mutatingItemId} // Pass the ID of the item being changed
            />
            <Link
              to="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={cart.subtotal}
              total={cart.total}
              discount={cart.discount}
              deliveryFee="Free" // From Figma
              onCheckout={handleCheckout}
              onApplyPromo={(promoCode) => {
                // Placeholder for promo code logic
                toast.error(`Promo code '${promoCode}' is not valid.`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Component (for loading state) ---
const CartPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
    {/* Breadcrumbs */}
    <div className="h-4 w-1/4 bg-gray-200 rounded mb-6"></div>
    {/* Header */}
    <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-2 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 border border-gray-200 rounded-lg"
          >
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
      {/* Right Column Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-6 w-3/4 bg-gray-200 rounded mt-6 mb-4"></div>
          <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

export default CartPage;
