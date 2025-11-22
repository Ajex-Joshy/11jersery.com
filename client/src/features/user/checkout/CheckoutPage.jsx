import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ShieldCheck, Lock } from "lucide-react";
import toast from "react-hot-toast";

// Hooks
import { useCart } from "../cart/cartHooks"; // Reusing cart data
import { useAddresses } from "../address/addressHooks";
// Components
import AddressSelection from "./components/AddressSelection";
import { CartProductList } from "../cart/components/CartProductList";
import { OrderSummary } from "../../../components/user/OrderSummary";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";

const CheckoutPage = () => {
  const navigate = useNavigate();

  // Data Fetching
  const {
    data: cartPayload,
    isLoading: isCartLoading,
    isError,
    error,
  } = useCart();
  const { data: addressesPayload } = useAddresses();

  // State
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Auto-select default address when addresses load
  console.log("addressesPayload", addressesPayload);
  useEffect(() => {
    if (addressesPayload?.data?.data && !selectedAddressId) {
      const defaultAddr = addressesPayload.data.data.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      else if (addressesPayload.data.length > 0)
        setSelectedAddressId(addressesPayload.data[0]._id);
    }
  }, [addressesPayload, selectedAddressId]);

  // Loading/Error States
  if (isCartLoading) return <LoadingSpinner text="Loading checkout..." />;
  if (isError) return <ErrorDisplay error={error} />;

  const cart = cartPayload?.data || {};
  const items = cart.items || [];

  // Redirect if empty
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          Go shopping
        </Link>
      </div>
    );
  }
  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    // Save selected address ID to local state/redux context if needed
    // For now, we just navigate to the next step
    navigate("/payment", { state: { selectedAddressId } });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm flex items-center gap-2 text-gray-500">
          <Link to="/cart" className="hover:text-black transition">
            Cart
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-black">Checkout</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT COLUMN (Main Content) --- */}
          <div className="lg:col-span-7 space-y-8">
            {/* Address Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <AddressSelection
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
              />
            </section>
          </div>

          {/* --- RIGHT COLUMN (Sidebar/Sticky) --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              {/* Items Review (Scrollable if too long) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  Order Items
                  <span className="text-xs font-normal text-gray-500">
                    {items.length} items
                  </span>
                </h3>
                {/* We reuse the list, but we can hide controls via CSS or props if we want it read-only. 
                    For now, keeping it editable is actually good UX. */}
                <CartProductList items={items} />
              </div>

              {/* Price Summary & Action */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <OrderSummary
                  subtotal={cart.subtotal}
                  total={cart.total}
                  discount={cart.discount}
                  deliveryFee={cart.deliveryFee}
                  isCheckoutPage={true} // Hides standard checkout button/promo input from reusable component
                />

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4 mb-6 bg-gray-50 py-2 rounded-lg">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>Secure SSL Encryption</span>
                </div>

                {/* Final Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Go to payment <Lock size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  By placing this order, you agree to our Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
