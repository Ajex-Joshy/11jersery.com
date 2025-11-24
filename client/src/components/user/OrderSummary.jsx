import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Tag, Loader2 } from "lucide-react";
import { useCart } from "../../features/user/cart/cartHooks";
import { LoadingSpinner, ErrorDisplay } from "../common/StateDisplays";

/**
 * Reusable component for showing order totals.
 * Used in CartPage and CheckoutPage.
 */
export const OrderSummary = ({ isCheckoutPage }) => {
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const onCheckout = () => {
    setIsProcessing(true);
    navigate("/checkout");
  };

  const handleApplyPromo = () => {
    if (!promoCode) return;
    setIsApplyingPromo(true);
    // Simulate API call
    setTimeout(() => {
      onApplyPromo(promoCode); // Call parent handler
      setIsApplyingPromo(false);
      setPromoCode("");
    }, 1000);
  };
  const {
    data: cartPayload,
    isLoading: isCartLoading,
    isError,
    error,
  } = useCart();

  const { subtotal, total, discountedPrice, deliveryFee } =
    cartPayload?.data || {};
  const discount = subtotal - discountedPrice;
  if (isCartLoading) return <LoadingSpinner text="Loading checkout..." />;
  if (isError) return <ErrorDisplay error={error} />;
  console.log(cartPayload);
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
      <h2 className="text-xl font-semibold mb-6 border-b pb-4">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            ₹{subtotal.toLocaleString()}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Discount</span>
            <span className="font-medium text-green-600">
              - ₹{discount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium text-gray-900">
            {typeof deliveryFee === "number"
              ? `₹${deliveryFee.toLocaleString()}`
              : deliveryFee}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      {!isCheckoutPage && (
        <>
          {/* Promo Code Form */}
          <div className="mt-6 space-y-2">
            <label
              htmlFor="promo"
              className="text-sm font-medium text-gray-700"
            >
              Add promo code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Tag
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-2 text-sm"
                />
              </div>
              <button
                onClick={handleApplyPromo}
                disabled={isApplyingPromo}
                className="bg-gray-200 text-gray-700 px-4 rounded-md text-sm font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                {isApplyingPromo ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={isProcessing}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition mt-6"
          >
            {isProcessing ? "Processing..." : "Checkout"}
            <ArrowRight size={18} />
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By continuing, I confirm that I have read and accept the
            <Link
              to="/terms-and-conditions"
              className="underline hover:text-black"
            >
              {" "}
              Terms and Conditions{" "}
            </Link>
            and
            <Link to="/privacy-policy" className="underline hover:text-black">
              {" "}
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
};
