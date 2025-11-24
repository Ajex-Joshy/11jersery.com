import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useCart, useClearCart } from "./cartHooks";
import { CartProductList } from "./components/CartProductList";
import { OrderSummary } from "../../../components/user/OrderSummary";
import { ErrorDisplay } from "../../../components/common/StateDisplays";
import { EmptyCart } from "./components/EmptyCart";
import CartPageSkeleton from "./components/CartSkelton";

const CartPage = () => {
  const navigate = useNavigate();

  const { data: cartPayload, isLoading, isError, error } = useCart();
  console.log(cartPayload);

  const { mutate: clearMutate, isLoading: isClearing } = useClearCart();

  const handleClearCart = () => {
    clearMutate(undefined, {
      onSuccess: () => toast.success("Cart cleared"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Failed to clear cart"),
    });
  };

  if (isLoading) {
    return <CartPageSkeleton />;
  }

  if (isError) {
    return <ErrorDisplay error={error} />;
  }

  const cart = cartPayload?.data || {};
  const items = cart.items || [];

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
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
            <CartProductList />
            <Link
              to="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
